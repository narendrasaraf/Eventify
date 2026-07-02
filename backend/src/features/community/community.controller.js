'use strict';

const CommunityService = require('./community.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const CommunityController = {
  // ─── Clubs ──────────────────────────────────────────────────────────────────
  getAllClubs: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const clubs = await CommunityService.getAllClubs(userId);
    res.status(200).json({ status: 'success', data: { clubs } });
  }),

  getClubById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const club = await CommunityService.getClubById(id, userId);
    res.status(200).json({ status: 'success', data: { club } });
  }),

  createClub: asyncHandler(async (req, res) => {
    const club = await CommunityService.createClub(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { club } });
  }),

  updateClub: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const club = await CommunityService.updateClub(id, req.body);
    res.status(200).json({ status: 'success', data: { club } });
  }),

  deleteClub: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.deleteClub(id);
    res.status(200).json({ status: 'success', ...result });
  }),

  joinClub: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.joinClub(id, req.user.id);
    res.status(200).json({ status: 'success', ...result });
  }),

  leaveClub: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.leaveClub(id, req.user.id);
    res.status(200).json({ status: 'success', ...result });
  }),

  // ─── Posts ──────────────────────────────────────────────────────────────────
  getClubPosts: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const userId = req.user ? req.user.id : null;
    const posts = await CommunityService.getClubPosts(clubId, req.query, userId);
    res.status(200).json({ status: 'success', data: { posts } });
  }),

  getGlobalPosts: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const posts = await CommunityService.getGlobalPosts(req.query, userId);
    res.status(200).json({ status: 'success', data: { posts } });
  }),

  createPost: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const post = await CommunityService.createPost(clubId, req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { post } });
  }),

  likePost: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.likePost(id, req.user.id);
    res.status(200).json({ status: 'success', ...result });
  }),

  deletePost: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.deletePost(id, req.user.id, req.user.role);
    res.status(200).json({ status: 'success', ...result });
  }),

  pinPost: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPinned } = req.body;
    const post = await CommunityService.pinPost(id, isPinned);
    res.status(200).json({ status: 'success', data: { post } });
  }),

  lockPost: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isLocked } = req.body;
    const post = await CommunityService.lockPost(id, isLocked);
    res.status(200).json({ status: 'success', data: { post } });
  }),

  // ─── Comments ───────────────────────────────────────────────────────────────
  getPostComments: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user ? req.user.id : null;
    const comments = await CommunityService.getPostComments(postId, userId);
    res.status(200).json({ status: 'success', data: { comments } });
  }),

  createComment: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const comment = await CommunityService.createComment(postId, req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { comment } });
  }),

  deleteComment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.deleteComment(id, req.user.id, req.user.role);
    res.status(200).json({ status: 'success', ...result });
  }),

  // ─── Resources ──────────────────────────────────────────────────────────────
  getClubResources: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const resources = await CommunityService.getClubResources(clubId);
    res.status(200).json({ status: 'success', data: { resources } });
  }),

  getGlobalResources: asyncHandler(async (req, res) => {
    const resources = await CommunityService.getGlobalResources(req.query);
    res.status(200).json({ status: 'success', data: { resources } });
  }),

  createResource: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const resource = await CommunityService.createResource(clubId, req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { resource } });
  }),

  deleteResource: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.deleteResource(id, req.user.id, req.user.role);
    res.status(200).json({ status: 'success', ...result });
  }),

  // ─── Chat History ───────────────────────────────────────────────────────────
  getChatHistory: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const messages = await CommunityService.getChatHistory(clubId);
    res.status(200).json({ status: 'success', data: { messages } });
  }),

  // ─── Event Integration ──────────────────────────────────────────────────────
  getClubEvents: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const events = await CommunityService.getClubEvents(clubId);
    res.status(200).json({ status: 'success', data: { events } });
  }),

  // ─── Members & Leaderboard ──────────────────────────────────────────────────
  getClubMembers: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const members = await CommunityService.getClubMembers(clubId);
    res.status(200).json({ status: 'success', data: { members } });
  }),

  getClubLeaderboard: asyncHandler(async (req, res) => {
    const { clubId } = req.params;
    const leaderboard = await CommunityService.getClubLeaderboard(clubId);
    res.status(200).json({ status: 'success', data: { leaderboard } });
  }),

  // ─── Admin Dashboard Features ───────────────────────────────────────────────
  getAnalytics: asyncHandler(async (req, res) => {
    const analytics = await CommunityService.getAnalytics();
    res.status(200).json({ status: 'success', data: { analytics } });
  }),

  createAnnouncement: asyncHandler(async (req, res) => {
    const announcement = await CommunityService.createAnnouncement(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { announcement } });
  }),

  getAllUsers: asyncHandler(async (req, res) => {
    const users = await CommunityService.getAllUsers();
    res.status(200).json({ status: 'success', data: { users } });
  }),

  blockUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await CommunityService.blockUser(id, reason);
    res.status(200).json({ status: 'success', data: { user } });
  }),

  unblockUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await CommunityService.unblockUser(id);
    res.status(200).json({ status: 'success', data: { user } });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await CommunityService.deleteUser(id);
    res.status(200).json({ status: 'success', ...result });
  }),
};

module.exports = CommunityController;
