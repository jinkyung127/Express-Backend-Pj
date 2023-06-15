const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comment");
const Post = require("../schemas/post");
const mongoose = require("mongoose");

// 댓글 작성
router.post("/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { user, password, content } = req.body;

  if (!user || !password || !content) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (!content) {
    return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
  }

  const post = await Post.findById(_postId);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  const createdComment = await Comment.create({
    user,
    password,
    content,
    postId: post._id, // 게시물의 _id 값을 postId 필드로 저장
  });

  res.json({ message: "댓글을 생성하였습니다." });
});

// 댓글 조회 API
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_postId)) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    const post = await Post.findById(_postId);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comments = await Comment.find({ postId: _postId })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json({ data: comments });
  } catch (error) {
    console.error(error);
  }
});

// router.get("/comments", (req, res) => {
//   return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
// });

// 댓글 수정 API
router.put("/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  const { password, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_commentId)) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (!content) {
    return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
  }

  if (!password) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  const comment = await Comment.findById(_commentId);

  if (!comment) {
    return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
  }

  comment.content = content; // 댓글 내용 수정
  await comment.save(); // 수정된 댓글 저장

  res.json({ message: "댓글을 수정하였습니다." });
});

// router.put("/comments", (req, res) => {
//   return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
// });

// 댓글 삭제 API
router.delete("/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  const { password } = req.body;

  const comment = await Comment.findById(_commentId);

  if (!_commentId || comment.password !== password) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (!comment) {
    return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
  }

  const deletedComment = await Comment.findByIdAndDelete(_commentId);
  res.json({ message: "댓글을 삭제하였습니다." });
});

// router.delete("/comments", (req, res) => {
//   return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
// });

module.exports = router;
