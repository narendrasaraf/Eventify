'use strict';

const ChatMessage = require('../../models/ChatMessage');
const ChatRoom = require('../../models/ChatRoom');
const ClubMember = require('../../models/ClubMember');
const User = require('../../models/User');
const jwtUtils = require('../../utils/jwt.utils');
const logger = require('../../utils/logger');

// Local tracking of active online members in each club room
// Map of clubId string -> Set of userId strings
const activeRoomUsers = new Map();

const parseCookies = (cookieString) => {
  const list = {};
  if (!cookieString) return list;
  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

const initCommunitySocket = (io) => {
  // Socket.IO middleware to authenticate connection via cookies
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwtUtils.verifyAccessToken(token);
      const user = await User.findById(decoded.sub);

      if (!user) {
        return next(new Error('User account not found'));
      }

      if (user.blocked || user.status === 'blocked' || !user.isActive) {
        return next(new Error('Your account has been blocked by the administrator.'));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
        role: user.role,
      };

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: User ${socket.user.name} (${socket.id})`);

    // ─── Join Room ──────────────────────────────────────────────────────────
    socket.on('joinRoom', async ({ clubId }) => {
      if (!clubId) return;

      socket.join(clubId);
      logger.info(`Socket: User ${socket.user.name} joined room ${clubId}`);

      // Add to online list
      if (!activeRoomUsers.has(clubId)) {
        activeRoomUsers.set(clubId, new Set());
      }
      activeRoomUsers.get(clubId).add(socket.user.id);

      // Fetch user profile info for active listing
      const onlineUserIds = Array.from(activeRoomUsers.get(clubId));
      const onlineUsersList = await User.find({ _id: { $in: onlineUserIds } }, 'name email profilePicture role');

      // Emit current online list to the room
      io.to(clubId).emit('activeUsers', onlineUsersList);
    });

    // ─── Leave Room ─────────────────────────────────────────────────────────
    socket.on('leaveRoom', async ({ clubId }) => {
      if (!clubId) return;

      socket.leave(clubId);
      logger.info(`Socket: User ${socket.user.name} left room ${clubId}`);

      if (activeRoomUsers.has(clubId)) {
        activeRoomUsers.get(clubId).delete(socket.user.id);
        
        const onlineUserIds = Array.from(activeRoomUsers.get(clubId));
        const onlineUsersList = await User.find({ _id: { $in: onlineUserIds } }, 'name email profilePicture role');
        io.to(clubId).emit('activeUsers', onlineUsersList);
      }
    });

    // ─── Send Message ───────────────────────────────────────────────────────
    socket.on('sendMessage', async ({ clubId, content, messageType, mediaUrl }) => {
      try {
        if (!clubId) return;

        // Ensure club has room
        let room = await ChatRoom.findOne({ clubId });
        if (!room) {
          room = await ChatRoom.create({ clubId, name: 'Lounge' });
        }

        // Save message to database
        const msg = await ChatMessage.create({
          roomId: room._id,
          clubId,
          sender: socket.user.id,
          messageType: messageType || 'text',
          content: content || '',
          mediaUrl: mediaUrl || '',
        });

        const populated = await msg.populate('sender', 'name email profilePicture role');

        io.to(clubId).emit('messageReceived', populated);
      } catch (err) {
        logger.error(`Socket sendMessage error: ${err.message}`);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ─── Typing Indicator ───────────────────────────────────────────────────
    socket.on('typing', ({ clubId, isTyping }) => {
      if (!clubId) return;
      socket.to(clubId).emit('userTyping', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping,
      });
    });

    // ─── Add Reaction ───────────────────────────────────────────────────────
    socket.on('addReaction', async ({ clubId, messageId, emoji }) => {
      try {
        if (!clubId || !messageId || !emoji) return;

        const message = await ChatMessage.findById(messageId);
        if (!message) return;

        // Remove previous reaction by this user
        const existingIdx = message.reactions.findIndex(
          (r) => r.userId.toString() === socket.user.id
        );

        if (existingIdx > -1) {
          if (message.reactions[existingIdx].emoji === emoji) {
            // Toggle off if same emoji
            message.reactions.splice(existingIdx, 1);
          } else {
            // Update emoji
            message.reactions[existingIdx].emoji = emoji;
          }
        } else {
          message.reactions.push({ userId: socket.user.id, emoji });
        }

        await message.save();

        io.to(clubId).emit('messageReactionUpdated', {
          messageId: message._id,
          reactions: message.reactions,
        });
      } catch (err) {
        logger.error(`Socket addReaction error: ${err.message}`);
      }
    });

    // ─── Pin Message ────────────────────────────────────────────────────────
    socket.on('pinMessage', async ({ clubId, messageId, isPinned }) => {
      try {
        if (!clubId || !messageId) return;

        // Verify that user is admin or club moderator
        const isAdmin = socket.user.role === 'admin' || socket.user.role === 'ADMIN';
        const membership = await ClubMember.findOne({ clubId, userId: socket.user.id });
        const isMod = membership && (membership.role === 'moderator' || membership.role === 'admin');

        if (!isAdmin && !isMod) {
          socket.emit('error', { message: 'Unauthorized to pin messages.' });
          return;
        }

        const message = await ChatMessage.findById(messageId);
        if (!message) return;

        message.isPinned = isPinned;
        await message.save();

        io.to(clubId).emit('messagePinned', {
          messageId: message._id,
          isPinned: message.isPinned,
          pinnedBy: socket.user.name,
        });
      } catch (err) {
        logger.error(`Socket pinMessage error: ${err.message}`);
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnecting', async () => {
      // Automatically remove from all active rooms
      for (const clubId of socket.rooms) {
        if (activeRoomUsers.has(clubId)) {
          activeRoomUsers.get(clubId).delete(socket.user.id);
          
          const onlineUserIds = Array.from(activeRoomUsers.get(clubId));
          const onlineUsersList = await User.find({ _id: { $in: onlineUserIds } }, 'name email profilePicture role');
          io.to(clubId).emit('activeUsers', onlineUsersList);
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: User ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = initCommunitySocket;
