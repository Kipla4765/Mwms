package com.example.demo.service;

import com.example.demo.dto.forum.PostRequest;
import com.example.demo.dto.forum.PostResponse;
import com.example.demo.dto.forum.ReplyRequest;
import com.example.demo.dto.forum.ReplyResponse;
import com.example.demo.model.ForumPost;
import com.example.demo.model.ForumPostSupport;
import com.example.demo.model.ForumPostSupportId;
import com.example.demo.model.ForumReply;
import com.example.demo.repository.ForumPostRepository;
import com.example.demo.repository.ForumPostSupportRepository;
import com.example.demo.repository.ForumReplyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForumService {

    private final ForumPostRepository forumPostRepository;
    private final ForumPostSupportRepository supportRepository;
    private final ForumReplyRepository replyRepository;

    public ForumService(ForumPostRepository forumPostRepository,
                        ForumPostSupportRepository supportRepository,
                        ForumReplyRepository replyRepository) {
        this.forumPostRepository = forumPostRepository;
        this.supportRepository = supportRepository;
        this.replyRepository = replyRepository;
    }

    public List<PostResponse> getPosts(String tag) {
        return forumPostRepository.findActivePosts(tag).stream()
                .map(this::toPostResponse)
                .collect(Collectors.toList());
    }

    public PostResponse createPost(PostRequest req, Integer userId) {
        ForumPost post = new ForumPost();
        post.setUserId(userId);
        post.setBody(req.body());
        post.setTag(req.tag() != null && !req.tag().isBlank() ? req.tag() : "General");
        post.setDisplayName(req.displayName() != null && !req.displayName().isBlank() ? req.displayName() : "Anonymous");
        return toPostResponse(forumPostRepository.save(post));
    }

    public long toggleSupport(Integer postId, Integer userId) {
        ForumPostSupportId supportId = new ForumPostSupportId(postId, userId);
        if (supportRepository.existsByIdPostIdAndIdUserId(postId, userId)) {
            supportRepository.deleteById(supportId);
        } else {
            supportRepository.save(new ForumPostSupport(supportId));
        }
        return supportRepository.countByIdPostId(postId);
    }

    public List<ReplyResponse> getReplies(Integer postId) {
        return replyRepository.findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(postId).stream()
                .map(r -> new ReplyResponse(r.getId(), r.getDisplayName(), r.getBody(), r.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public ReplyResponse addReply(Integer postId, ReplyRequest req, Integer userId) {
        ForumReply reply = new ForumReply();
        reply.setPostId(postId);
        reply.setUserId(userId);
        reply.setBody(req.text());
        reply.setDisplayName(req.displayName() != null && !req.displayName().isBlank() ? req.displayName() : "Anonymous");
        ForumReply saved = replyRepository.save(reply);
        return new ReplyResponse(saved.getId(), saved.getDisplayName(), saved.getBody(), saved.getCreatedAt());
    }

    private PostResponse toPostResponse(ForumPost post) {
        long supportCount = supportRepository.countByIdPostId(post.getId());
        long replyCount = replyRepository.countByPostIdAndIsDeletedFalse(post.getId());
        return new PostResponse(
                post.getId(), post.getDisplayName(), post.getTag(), post.getBody(),
                post.isFeatured(), post.getCreatedAt(), supportCount, replyCount
        );
    }
}
