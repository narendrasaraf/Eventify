'use strict';

const Club = require('../../models/Club');
const ClubMember = require('../../models/ClubMember');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const ChatRoom = require('../../models/ChatRoom');
const ChatMessage = require('../../models/ChatMessage');
const Resource = require('../../models/Resource');
const Announcement = require('../../models/Announcement');
const User = require('../../models/User');

const CommunityRepository = {
  // ─── Clubs ──────────────────────────────────────────────────────────────────
  findAllClubs: () => Club.find().sort({ name: 1 }),
  findClubById: (id) => Club.findById(id),
  findClubByName: (name) => Club.findOne({ name }),
  createClub: (data) => Club.create(data),
  updateClub: (id, updates) => Club.findByIdAndUpdate(id, updates, { new: true }),
  deleteClub: (id) => Club.findByIdAndDelete(id),
  countClubs: () => Club.countDocuments(),

  // ─── Club Membership ────────────────────────────────────────────────────────
  findMember: (clubId, userId) => ClubMember.findOne({ clubId, userId }),
  findMembersByClub: (clubId) => ClubMember.find({ clubId }).populate('userId', 'name email profilePicture role'),
  findClubsByUser: (userId) => ClubMember.find({ userId }).populate('clubId'),
  createMember: (data) => ClubMember.create(data),
  deleteMember: (clubId, userId) => ClubMember.findOneAndDelete({ clubId, userId }),
  deleteMembersByClub: (clubId) => ClubMember.deleteMany({ clubId }),
  countMembers: (clubId) => ClubMember.countDocuments({ clubId }),

  // ─── Posts ──────────────────────────────────────────────────────────────────
  findPostsByClub: (clubId, queryOptions = {}) => {
    const filter = { clubId };
    const sort = {};

    if (queryOptions.filter === 'pinned') {
      filter.isPinned = true;
    }

    if (queryOptions.sort === 'popular') {
      sort.likesCount = -1;
    } else {
      sort.createdAt = -1;
    }

    // Default: pinned posts first, then sort
    return Post.find(filter)
      .populate('author', 'name email profilePicture role')
      .sort({ isPinned: -1, ...sort });
  },
  findPostById: (id) => Post.findById(id).populate('author', 'name email profilePicture role'),
  createPost: (data) => Post.create(data),
  updatePost: (id, updates) => Post.findByIdAndUpdate(id, updates, { new: true }),
  deletePost: (id) => Post.findByIdAndDelete(id),
  deletePostsByClub: (clubId) => Post.deleteMany({ clubId }),
  countPosts: () => Post.countDocuments(),
  findGlobalPosts: (limit = 20) => Post.find().populate('author', 'name email profilePicture role').populate('clubId', 'name').sort({ createdAt: -1 }).limit(limit),

  // ─── Comments ───────────────────────────────────────────────────────────────
  findCommentsByPost: (postId) =>
    Comment.find({ postId })
      .populate('author', 'name email profilePicture role')
      .sort({ createdAt: 1 }),
  findCommentById: (id) => Comment.findById(id),
  createComment: (data) => Comment.create(data),
  deleteComment: (id) => Comment.findByIdAndDelete(id),
  deleteCommentsByPost: (postId) => Comment.deleteMany({ postId }),
  deleteCommentsByClub: (clubId) => Comment.deleteMany({ clubId }),

  // ─── Resources ──────────────────────────────────────────────────────────────
  findResourcesByClub: (clubId) =>
    Resource.find({ clubId })
      .populate('uploadedBy', 'name email profilePicture role')
      .sort({ createdAt: -1 }),
  findResourceById: (id) => Resource.findById(id),
  createResource: (data) => Resource.create(data),
  deleteResource: (id) => Resource.findByIdAndDelete(id),
  deleteResourcesByClub: (clubId) => Resource.deleteMany({ clubId }),
  findGlobalResources: (limit = 20) => Resource.find().populate('uploadedBy', 'name email profilePicture role').populate('clubId', 'name').sort({ createdAt: -1 }).limit(limit),

  // ─── Chat ───────────────────────────────────────────────────────────────────
  findRoomByClubId: (clubId) => ChatRoom.findOne({ clubId }),
  createRoom: (data) => ChatRoom.create(data),
  deleteRoomByClub: (clubId) => ChatRoom.findOneAndDelete({ clubId }),
  
  findMessagesByRoom: (roomId, limit = 50) =>
    ChatMessage.find({ roomId })
      .populate('sender', 'name email profilePicture role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((msgs) => msgs.reverse()),
  findMessageById: (id) => ChatMessage.findById(id),
  createMessage: (data) => ChatMessage.create(data),
  deleteMessagesByRoom: (roomId) => ChatMessage.deleteMany({ roomId }),
  countMessages: () => ChatMessage.countDocuments(),

  // ─── Announcements ──────────────────────────────────────────────────────────
  findAnnouncements: () =>
    Announcement.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 }),
  createAnnouncement: (data) => Announcement.create(data),

  // ─── User Management ────────────────────────────────────────────────────────
  findAllUsers: () => User.find().sort({ name: 1 }),
  findUserById: (id) => User.findById(id),
  updateUserById: (id, updates) => User.findByIdAndUpdate(id, updates, { new: true }),
  deleteUserById: (id) => User.findByIdAndDelete(id),
  countUsers: (filter = {}) => User.countDocuments(filter),
};

module.exports = CommunityRepository;
