'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context';
import Link from 'next/link';

interface CommentItem {
  id: number;
  product_id: number;
  parent_id: number | null;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  is_staff: boolean;
  comment: string;
  created_at: string;
  created_at_human: string;
  is_owner: boolean;
  replies: CommentItem[];
}

interface ProductCommentsProps {
  productId: number;
  onCommentCountUpdate?: (count: number) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😍', '👏', '🎉', '💯', '✨', '🙌', '👌', '⭐', '😊', '🤔', '💬'];

// Robust Avatar component with graceful image error handling and initial avatar fallback
function UserAvatar({ name, image, size = 'w-9 h-9', textSize = 'text-xs' }: { name: string; image?: string | null; size?: string; textSize?: string }) {
  const { resolveImageUrl } = useApp();
  const [hasError, setHasError] = useState(false);

  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const resolvedUrl = image ? resolveImageUrl(image) : null;

  if (resolvedUrl && !hasError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'User'}
        onError={() => setHasError(true)}
        className={`${size} rounded-full object-cover border border-slate-200 shadow-sm shrink-0`}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black ${textSize} shadow-sm shrink-0`}>
      {initial}
    </div>
  );
}

export default function ProductComments({ productId, onCommentCountUpdate }: ProductCommentsProps) {
  const { user, token, showToast } = useApp();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Top level comment input
  const [commentText, setCommentText] = useState<string>('');
  const [showTopEmojiPicker, setShowTopEmojiPicker] = useState<boolean>(false);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`http://127.0.0.1:8088/api/products/${productId}/comments`, {
        headers,
      });

      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();

      if (data.status === 'success' && data.data) {
        setComments(data.data.comments || []);
        setTotalComments(data.data.total_comments || 0);

        if (onCommentCountUpdate) {
          onCommentCountUpdate(data.data.total_comments || 0);
        }
      }
    } catch (err) {
      console.error('Comments fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, token, onCommentCountUpdate]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostTopComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please sign in to post a comment', 'error');
      return;
    }

    if (!commentText.trim()) {
      showToast('Please write a comment first', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`http://127.0.0.1:8088/api/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: commentText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to post comment');

      showToast('Comment posted successfully!', 'success');
      setCommentText('');
      setShowTopEmojiPicker(false);
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Error posting comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!token) {
      showToast('Please sign in to reply', 'error');
      return;
    }

    if (!replyText.trim()) {
      showToast('Please write a reply first', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`http://127.0.0.1:8088/api/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: replyText.trim(),
          parent_id: parentId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to post reply');

      showToast('Reply posted successfully!', 'success');
      setReplyingToId(null);
      setReplyText('');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Error posting reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!token || !editText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`http://127.0.0.1:8088/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: editText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to edit comment');

      showToast('Comment updated successfully!', 'success');
      setEditingCommentId(null);
      setEditText('');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Error editing comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`http://127.0.0.1:8088/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete comment');
      showToast('Comment deleted', 'info');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Error deleting comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEmoji = (emoji: string, target: 'top' | 'reply') => {
    if (target === 'top') {
      setCommentText((prev) => prev + emoji);
    } else if (target === 'reply') {
      setReplyText((prev) => prev + emoji);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Facebook Style Top-Level Comment Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {!user ? (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <h4 className="text-base font-bold text-slate-800 mb-1">Join the Discussion</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Have questions about this item? Ask our community or customer care team.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            >
              Sign In to Comment
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePostTopComment} className="space-y-3">
            <div className="flex items-start gap-3">
              <UserAvatar name={user.name} image={user.avatar} size="w-10 h-10" />

              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  placeholder="Ask a question or write a comment about this product..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all resize-none"
                />

                {/* Quick Emoji Bar */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-md scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setShowTopEmojiPicker(!showTopEmojiPicker)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 transition-all font-bold"
                      title="Toggle Emojis"
                    >
                      😀 Emojis
                    </button>
                    {QUICK_EMOJIS.slice(0, 8).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji, 'top')}
                        className="px-1.5 py-0.5 text-base hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 shrink-0 shadow-sm"
                  >
                    {isSubmitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>

                {/* Expanded Emoji Drawer */}
                {showTopEmojiPicker && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-2 animate-fadeIn">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji, 'top')}
                        className="p-1 text-xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 2. Threaded Discussion Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Discussion & Questions ({totalComments})
          </h4>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading discussion...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex items-start gap-3 group">
                  <UserAvatar name={comment.user_name} image={comment.user_avatar} size="w-10 h-10" />

                  <div className="flex-1">
                    {/* Comment Bubble */}
                    <div className="bg-slate-100/80 hover:bg-slate-100 px-4 py-3 rounded-2xl md:rounded-3xl rounded-tl-sm transition-all max-w-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs md:text-sm font-black text-slate-900">
                          {comment.user_name}
                        </span>
                        {comment.is_staff && (
                          <span className="px-2 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                            Admin Staff
                          </span>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateComment(comment.id)}
                              className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {comment.comment}
                        </p>
                      )}
                    </div>

                    {/* Action footer (Facebook style) */}
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 mt-1 pl-2">
                      <span>{comment.created_at_human}</span>

                      {user && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(replyingToId === comment.id ? null : comment.id);
                            setReplyText('');
                          }}
                          className="hover:text-brand-orange transition-colors"
                        >
                          Reply
                        </button>
                      )}

                      {comment.is_owner && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditText(comment.comment);
                            }}
                            className="hover:text-slate-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                    {/* Inline Reply Input */}
                    {replyingToId === comment.id && (
                      <div className="mt-3 pl-2 flex items-start gap-2.5 max-w-xl animate-fadeIn">
                        <UserAvatar name={user?.name || 'U'} image={user?.avatar} size="w-7 h-7" textSize="text-[10px]" />
                        <div className="flex-1 space-y-1.5">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={1}
                            placeholder={`Reply to ${comment.user_name}...`}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none bg-white"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              {QUICK_EMOJIS.slice(0, 6).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => addEmoji(emoji, 'reply')}
                                  className="text-sm hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostReply(comment.id)}
                                disabled={isSubmitting || !replyText.trim()}
                                className="px-4 py-1 bg-brand-orange hover:bg-orange-600 text-white text-xs font-black rounded-lg uppercase tracking-wider transition-all disabled:opacity-40"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Threaded Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 md:pl-6 border-l-2 border-slate-200/80 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2.5">
                            <UserAvatar name={reply.user_name} image={reply.user_avatar} size="w-8 h-8" textSize="text-[10px]" />

                            <div className="flex-1">
                              <div className="bg-slate-100/70 hover:bg-slate-100 px-3.5 py-2.5 rounded-2xl rounded-tl-sm transition-all max-w-xl">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-black text-slate-900">
                                    {reply.user_name}
                                  </span>
                                  {reply.is_staff && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider">
                                      Staff
                                    </span>
                                  )}
                                </div>

                                {editingCommentId === reply.id ? (
                                  <div className="mt-1 space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      rows={2}
                                      className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateComment(reply.id)}
                                        className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                                    {reply.comment}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-1 pl-2">
                                <span>{reply.created_at_human}</span>
                                {user && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToId(comment.id);
                                      setReplyText(`@${reply.user_name} `);
                                    }}
                                    className="hover:text-brand-orange transition-colors"
                                  >
                                    Reply
                                  </button>
                                )}
                                {reply.is_owner && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(reply.id);
                                        setEditText(reply.comment);
                                      }}
                                      className="hover:text-slate-900 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="hover:text-red-600 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
