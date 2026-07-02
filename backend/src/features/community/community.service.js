'use strict';

const CommunityRepository = require('./community.repository');
const Event = require('../../models/Event');
const Booking = require('../../models/Booking');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const CommunityService = {
  // ─── Clubs ──────────────────────────────────────────────────────────────────
  getAllClubs: async (userId) => {
    const clubs = await CommunityRepository.findAllClubs();
    let joinedIds = new Set();
    if (userId) {
      const joined = await CommunityRepository.findClubsByUser(userId);
      joinedIds = new Set(joined.map((m) => m.clubId._id.toString()));
    }
    return clubs.map((club) => ({
      ...club.toObject(),
      isJoined: joinedIds.has(club._id.toString()),
    }));
  },

  getClubById: async (clubId, userId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    let isJoined = false;
    let role = null;
    if (userId) {
      const membership = await CommunityRepository.findMember(clubId, userId);
      isJoined = !!membership;
      role = membership ? membership.role : null;
    }

    return {
      ...club.toObject(),
      isJoined,
      role,
    };
  },

  createClub: async (data, adminId) => {
    const existing = await CommunityRepository.findClubByName(data.name);
    if (existing) throw new AppError('Club with this name already exists', 400, 'CLUB_EXISTS');

    const club = await CommunityRepository.createClub({ ...data, createdBy: adminId });
    // Auto-create Chat Room for the club
    await CommunityRepository.createRoom({
      clubId: club._id,
      name: `${club.name} Lounge`,
    });

    return club;
  },

  updateClub: async (clubId, updates) => {
    const club = await CommunityRepository.updateClub(clubId, updates);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    return club;
  },

  deleteClub: async (clubId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    await CommunityRepository.deleteMembersByClub(clubId);
    await CommunityRepository.deletePostsByClub(clubId);
    await CommunityRepository.deleteCommentsByClub(clubId);
    await CommunityRepository.deleteResourcesByClub(clubId);
    await CommunityRepository.deleteRoomByClub(clubId);
    await CommunityRepository.deleteClub(clubId);

    return { success: true };
  },

  joinClub: async (clubId, userId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    const existing = await CommunityRepository.findMember(clubId, userId);
    if (existing) throw new AppError('You are already a member of this club', 400, 'ALREADY_MEMBER');

    await CommunityRepository.createMember({ clubId, userId });
    
    // Increment member count
    club.totalMembers = await CommunityRepository.countMembers(clubId);
    await club.save();

    return { success: true, totalMembers: club.totalMembers };
  },

  leaveClub: async (clubId, userId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    const existing = await CommunityRepository.findMember(clubId, userId);
    if (!existing) throw new AppError('You are not a member of this club', 400, 'NOT_MEMBER');

    await CommunityRepository.deleteMember(clubId, userId);

    // Decrement member count
    club.totalMembers = await CommunityRepository.countMembers(clubId);
    await club.save();

    return { success: true, totalMembers: club.totalMembers };
  },

  // ─── Posts ──────────────────────────────────────────────────────────────────
  getClubPosts: async (clubId, queryOptions, userId) => {
    const posts = await CommunityRepository.findPostsByClub(clubId, queryOptions);
    return posts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: userId ? post.likes.some((id) => id.toString() === userId.toString()) : false,
      };
    });
  },

  getGlobalPosts: async (queryOptions, userId) => {
    const limit = queryOptions.limit ? parseInt(queryOptions.limit, 10) : 20;
    const posts = await CommunityRepository.findGlobalPosts(limit);
    return posts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: userId ? post.likes.some((id) => id.toString() === userId.toString()) : false,
      };
    });
  },

  createPost: async (clubId, postData, userId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    // Create the post
    const post = await CommunityRepository.createPost({
      ...postData,
      clubId,
      author: userId,
    });
    return post;
  },

  likePost: async (postId, userId) => {
    const post = await CommunityRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

    const likedIndex = post.likes.findIndex((id) => id.toString() === userId.toString());
    let isLiked = false;

    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
      isLiked = true;
    }

    post.likesCount = post.likes.length;
    await post.save();

    return { success: true, likesCount: post.likesCount, isLiked };
  },

  deletePost: async (postId, userId, userRole) => {
    const post = await CommunityRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

    const isAdmin = userRole === 'admin' || userRole === 'ADMIN';
    if (post.author._id.toString() !== userId.toString() && !isAdmin) {
      throw new AppError('You are not authorized to delete this post', 403, 'UNAUTHORIZED');
    }

    await CommunityRepository.deleteCommentsByPost(postId);
    await CommunityRepository.deletePost(postId);

    return { success: true };
  },

  pinPost: async (postId, isPinned) => {
    const post = await CommunityRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

    post.isPinned = isPinned;
    await post.save();
    return post;
  },

  lockPost: async (postId, isLocked) => {
    const post = await CommunityRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

    post.isLocked = isLocked;
    await post.save();
    return post;
  },

  // ─── Comments ───────────────────────────────────────────────────────────────
  getPostComments: async (postId, userId) => {
    const comments = await CommunityRepository.findCommentsByPost(postId);
    
    // Build tree
    const commentMap = {};
    const roots = [];

    comments.forEach((c) => {
      const cObj = c.toObject();
      cObj.replies = [];
      cObj.isLiked = userId ? c.likes.some((id) => id.toString() === userId.toString()) : false;
      commentMap[c._id.toString()] = cObj;
    });

    comments.forEach((c) => {
      const cObj = commentMap[c._id.toString()];
      if (c.parentId) {
        const parent = commentMap[c.parentId.toString()];
        if (parent) {
          parent.replies.push(cObj);
        } else {
          // Parent might be deleted, show as root
          roots.push(cObj);
        }
      } else {
        roots.push(cObj);
      }
    });

    return roots;
  },

  createComment: async (postId, commentData, userId) => {
    const post = await CommunityRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    if (post.isLocked) throw new AppError('This discussion is locked', 400, 'DISCUSSION_LOCKED');

    const comment = await CommunityRepository.createComment({
      ...commentData,
      postId,
      clubId: post.clubId,
      author: userId,
    });

    // Update count
    post.commentsCount += 1;
    await post.save();

    return comment;
  },

  deleteComment: async (commentId, userId, userRole) => {
    const comment = await CommunityRepository.findCommentById(commentId);
    if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');

    const isAdmin = userRole === 'admin' || userRole === 'ADMIN';
    if (comment.author.toString() !== userId.toString() && !isAdmin) {
      throw new AppError('You are not authorized to delete this comment', 403, 'UNAUTHORIZED');
    }

    const post = await CommunityRepository.findPostById(comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    await CommunityRepository.deleteComment(commentId);
    return { success: true };
  },

  // ─── Resources ──────────────────────────────────────────────────────────────
  getClubResources: async (clubId) => {
    return CommunityRepository.findResourcesByClub(clubId);
  },

  getGlobalResources: async (queryOptions) => {
    const limit = queryOptions.limit ? parseInt(queryOptions.limit, 10) : 20;
    return CommunityRepository.findGlobalResources(limit);
  },

  createResource: async (clubId, resourceData, userId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    const resource = await CommunityRepository.createResource({
      ...resourceData,
      clubId,
      uploadedBy: userId,
    });
    return resource;
  },

  deleteResource: async (resourceId, userId, userRole) => {
    const resource = await CommunityRepository.findResourceById(resourceId);
    if (!resource) throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');

    const isAdmin = userRole === 'admin' || userRole === 'ADMIN';
    if (resource.uploadedBy.toString() !== userId.toString() && !isAdmin) {
      throw new AppError('You are not authorized to delete this resource', 403, 'UNAUTHORIZED');
    }

    await CommunityRepository.deleteResource(resourceId);
    return { success: true };
  },

  // ─── Chat ───────────────────────────────────────────────────────────────────
  getChatHistory: async (clubId) => {
    const room = await CommunityRepository.findRoomByClubId(clubId);
    if (!room) throw new AppError('ChatRoom not configured for this club', 404, 'ROOM_NOT_FOUND');

    return CommunityRepository.findMessagesByRoom(room._id);
  },

  // ─── Event Integration ──────────────────────────────────────────────────────
  getClubEvents: async (clubId) => {
    const club = await CommunityRepository.findClubById(clubId);
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');

    // Query published events
    const allEvents = await Event.find({ status: 'published' });
    
    // Simple relevance match: match category or name keywords
    const clubKeywords = club.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const related = allEvents.filter((evt) => {
      const categoryMatch = evt.category.toLowerCase() === club.category.toLowerCase() ||
        evt.category.toLowerCase().includes(club.category.toLowerCase()) ||
        club.category.toLowerCase().includes(evt.category.toLowerCase());
      
      const evtTitle = evt.eventName.toLowerCase();
      const keywordMatch = clubKeywords.some((kw) => evtTitle.includes(kw));

      return categoryMatch || keywordMatch;
    });

    return related;
  },

  // ─── Members & Leaderboard ──────────────────────────────────────────────────
  getClubMembers: async (clubId) => {
    return CommunityRepository.findMembersByClub(clubId);
  },

  getClubLeaderboard: async (clubId) => {
    // Return members ranked by active participation (posts + comments) in this club
    const members = await CommunityRepository.findMembersByClub(clubId);
    
    const leaderboard = [];
    for (const mem of members) {
      const postsCount = await require('../../models/Post').countDocuments({ clubId, author: mem.userId._id });
      const commentsCount = await require('../../models/Comment').countDocuments({ clubId, author: mem.userId._id });
      const score = (postsCount * 10) + (commentsCount * 5); // 10 pts per post, 5 pts per comment

      leaderboard.push({
        user: mem.userId,
        postsCount,
        commentsCount,
        score,
      });
    }

    return leaderboard.sort((a, b) => b.score - a.score);
  },

  // ─── Admin Analytics & Operations ───────────────────────────────────────────
  getAnalytics: async () => {
    const totalUsers = await CommunityRepository.countUsers();
    const blockedUsers = await CommunityRepository.countUsers({ status: 'blocked' });
    const activeUsers = await CommunityRepository.countUsers({ status: 'active', isActive: true });
    const totalClubs = await CommunityRepository.countClubs();
    const totalDiscussions = await CommunityRepository.countPosts();
    const totalMessages = await CommunityRepository.countMessages();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Revenue sum
    const bookings = await Booking.find({ status: 'Confirmed' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    const recentRegistrations = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'eventName ticketPrice')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Booking.find({ status: 'Confirmed' })
      .populate('userId', 'name email')
      .populate('eventId', 'eventName ticketPrice')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentDiscussions = await require('../../models/Post').find()
      .populate('author', 'name email')
      .populate('clubId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      totalUsers,
      blockedUsers,
      activeUsers,
      totalClubs,
      totalDiscussions,
      totalMessages,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentRegistrations,
      recentPayments,
      recentDiscussions,
    };
  },

  createAnnouncement: async (announcementData, adminId) => {
    const announcement = await CommunityRepository.createAnnouncement({
      ...announcementData,
      createdBy: adminId,
    });

    // Create system-wide notifications for all active users
    try {
      const activeUsersList = await require('../../models/User').find({ status: 'active', isActive: true });
      const Notification = require('../../models/Notification');
      const notifications = activeUsersList.map((usr) => ({
        userId: usr._id,
        title: `Announcement: ${announcement.title}`,
        body: announcement.body,
        type: 'info',
      }));
      await Notification.insertMany(notifications);
    } catch (err) {
      logger.error(`Announcement notifications failed: ${err.message}`);
    }

    return announcement;
  },

  getAllUsers: async () => {
    return CommunityRepository.findAllUsers();
  },

  blockUser: async (userId, blockedReason) => {
    const user = await CommunityRepository.updateUserById(userId, {
      status: 'blocked',
      blocked: true,
      blockedAt: new Date(),
      blockedReason: blockedReason || 'Violating platform guidelines.',
      isActive: false, // deactivate account
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    logger.info(`User Blocked: ${user.email} (${userId})`);
    return user;
  },

  unblockUser: async (userId) => {
    const user = await CommunityRepository.updateUserById(userId, {
      status: 'active',
      blocked: false,
      blockedAt: null,
      blockedReason: '',
      isActive: true,
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    logger.info(`User Unblocked: ${user.email} (${userId})`);
    return user;
  },

  deleteUser: async (userId) => {
    const user = await CommunityRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    await CommunityRepository.deleteUserById(userId);
    // Delete their bookings and other associations
    await Booking.deleteMany({ userId });
    logger.info(`User Account Deleted: ${user.email} (${userId})`);
    return { success: true };
  },
};

module.exports = CommunityService;
