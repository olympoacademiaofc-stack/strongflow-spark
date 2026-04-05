import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Heart, Pin, Trash2, Send, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MuralPost {
  id: string;
  content: string;
  image_url: string | null;
  author_id: string;
  author_name: string;
  author_role: string;
  is_fixed: boolean;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export const MuralSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<MuralPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
    
    // Inscrição Real-time Otimizada
    const channel = supabase
      .channel('mural_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mural_posts' }, (payload) => {
        const newPost = payload.new as any;
        setPosts(prev => {
          // Evitar duplicata se o post foi criado por este usuário (já adicionado via optimistic UI)
          if (prev.some(p => p.id === newPost.id)) return prev;
          
          const postWithStats = {
            ...newPost,
            likes_count: 0,
            comments_count: 0,
            user_has_liked: false
          };
          
          return [postWithStats, ...prev].sort((a, b) => {
            if (a.is_fixed !== b.is_fixed) return a.is_fixed ? -1 : 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mural_posts' }, (payload) => {
        const updatedPost = payload.new as any;
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mural_posts' }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      // Likes e Comentários também disparam atualização se necessário (para outros usuários)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mural_likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mural_comments' }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: rawPosts, error } = await supabase
        .from('mural_posts')
        .select('*')
        .order('is_fixed', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithStats = await Promise.all((rawPosts || []).map(async (post) => {
        const { count: likesCount } = await supabase
          .from('mural_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: commentsCount } = await supabase
          .from('mural_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { data: userLike } = await supabase
          .from('mural_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user?.id)
          .maybeSingle();

        return {
          ...post,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          user_has_liked: !!userLike
        };
      }));

      setPosts(postsWithStats);
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mural')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mural')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !selectedImage) || !user) return;
    
    // Captura o estado atual para rollback em caso de erro
    const previousPosts = [...posts];
    const tempId = `temp-${Date.now()}`;
    const role = user.role || 'aluno';
    
    // 1. Update Otimista (Interface responde NA HORA)
    const optimisticPost: MuralPost = {
      id: tempId,
      content: newPostContent,
      image_url: imagePreview, // Usar preview local enquanto faz upload
      author_id: user.id,
      author_name: user.name || "Usuário",
      author_role: role,
      is_fixed: false,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user_has_liked: false
    };

    setPosts(prev => [optimisticPost, ...prev]);
    setNewPostContent("");
    removeSelectedImage();
    setPosting(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { data, error } = await supabase.from('mural_posts').insert([{
        content: optimisticPost.content,
        image_url: imageUrl,
        author_id: user.id,
        author_name: optimisticPost.author_name,
        author_role: role
      }]).select().single();

      if (error) throw error;
      
      // Substituir o post temporário pelo real do banco
      setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id, image_url: data.image_url } : p));
      toast({ title: "Publicado!", description: "Sua mensagem foi adicionada ao mural." });
    } catch (err: any) {
      // Rollback em caso de erro
      setPosts(previousPosts);
      toast({ title: "Erro ao postar", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string, hasLiked: boolean) => {
    if (!user) return;
    
    // Update Otimista
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          user_has_liked: !hasLiked,
          likes_count: hasLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
        };
      }
      return p;
    }));

    try {
      if (hasLiked) {
        await supabase.from('mural_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('mural_likes').insert([{ post_id: postId, user_id: user.id }]);
      }
    } catch (err: any) {
      console.error("Like error:", err.message);
      // Rollback discreto
      fetchPosts();
    }
  };

  const handleToggleFix = async (postId: string, currentStatus: boolean) => {
    // Update Otimista
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_fixed: !currentStatus } : p)
      .sort((a, b) => {
        if (a.is_fixed !== b.is_fixed) return a.is_fixed ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    );

    try {
      const { error } = await supabase.from('mural_posts').update({ is_fixed: !currentStatus }).eq('id', postId);
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Erro", description: "Apenas staff pode fixar posts.", variant: "destructive" });
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const { error } = await supabase.from('mural_posts').delete().eq('id', postId);
      if (error) throw error;
    } catch (err: any) {
      setPosts(previousPosts);
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6">
      <Card className="bg-[#1A1A1A] border-white/5 shadow-xl transition-all duration-300">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold shrink-0 text-lg sm:text-xl shadow-lg ring-2 ring-white/5">
              {user?.name?.charAt(0) || "U"}
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Compartilhe algo com a comunidade..."
              className="flex-1 bg-[#252525] border-none rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-primary/30 min-h-[80px] sm:min-h-[100px] resize-none transition-all"
            />
          </div>

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 ml-13 sm:ml-16 animate-in fade-in zoom-in duration-300">
              <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
              <button 
                onClick={removeSelectedImage}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-colors gap-2 px-3"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">Foto</span>
              </Button>
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={posting || (!newPostContent.trim() && !selectedImage)}
              className="gold-gradient text-primary-foreground gap-2 h-9 sm:h-10 px-6 sm:px-8 font-bold rounded-xl shadow-md transform active:scale-95 transition-all text-xs sm:text-sm"
            >
              <Send className="h-4 w-4" />
              {posting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/5" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic bg-white/5 rounded-xl border border-dashed border-white/10">
            Nenhuma mensagem no mural ainda. Seja o primeiro!
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={`bg-[#1A1A1A] border-white/5 transition-all duration-300 hover:border-white/10 ${post.is_fixed ? "ring-1 ring-primary/20" : ""}`}>
              <CardContent className="p-4 sm:p-6">
                {post.is_fixed && (
                  <div className="flex items-center gap-1.5 text-primary text-[10px] sm:text-[11px] font-bold uppercase mb-4 tracking-wider">
                    <Pin className="h-3 w-3 fill-primary" /> Fixado
                  </div>
                )}
                
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shrink-0 shadow-sm ring-1 ring-white/10">
                    {post.author_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-100 text-sm sm:text-base">{post.author_name}</span>
                          {post.author_role !== 'aluno' && (
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[9px] sm:text-[10px] font-bold px-1.5 py-0">
                              ADMIN
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium lowercase">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {(user?.role === 'admin' || user?.role === 'professor' || user?.role === 'colaborador') && (
                          <Button variant="ghost" size="icon" onClick={() => handleToggleFix(post.id, post.is_fixed)} className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-primary">
                            <Pin className={`h-3 w-3 sm:h-4 sm:w-4 ${post.is_fixed ? "fill-primary text-primary" : ""}`} />
                          </Button>
                        )}
                        {(user?.id === post.author_id || user?.role === 'admin') && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-red-400">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-200 text-sm sm:text-[14px] mt-3 sm:mt-4 leading-relaxed whitespace-pre-wrap font-medium">
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-black/20">
                        <img 
                          src={post.image_url} 
                          alt="Conteúdo do post" 
                          className="w-full max-h-[450px] object-contain hover:scale-[1.02] transition-transform duration-500" 
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => handleLike(post.id, post.user_has_liked)}
                        className={`flex items-center gap-2 text-xs transition-all ${
                          post.user_has_liked ? "text-primary font-bold scale-105" : "text-gray-500 hover:text-primary"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.user_has_liked ? "fill-primary" : ""}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button 
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </button>
                    </div>

                    {expandedComments[post.id] && (
                      <div className="mt-4 pt-4 border-l-2 border-primary/20 pl-3 sm:pl-4 animate-in fade-in slide-in-from-top-1 duration-300">
                        <CommentSection postId={post.id} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ postId }: { postId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mural_comments',
        filter: `post_id=eq.${postId}` 
      }, (payload) => {
        const newCom = payload.new as any;
        setComments(prev => {
          if (prev.some(c => c.id === newCom.id)) return prev;
          return [...prev, newCom];
        });
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'mural_comments',
        filter: `post_id=eq.${postId}`
      }, (payload) => {
        setComments(prev => prev.filter(c => c.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase.from('mural_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    const previousComments = [...comments];
    const tempId = `temp-comm-${Date.now()}`;
    
    // Update Otimista
    const optimisticComment = {
      id: tempId,
      post_id: postId,
      author_id: user.id,
      author_name: user.name || "Usuário",
      content: newComment,
      created_at: new Date().toISOString()
    };

    setComments(prev => [...prev, optimisticComment]);
    setNewComment("");

    try {
      const { data, error } = await supabase.from('mural_comments').insert([{
        post_id: postId,
        author_id: user.id,
        author_name: optimisticComment.author_name,
        content: optimisticComment.content
      }]).select().single();

      if (error) throw error;
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
    } catch (err: any) {
      setComments(previousComments);
      toast({ title: "Erro ao comentar", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      const { error } = await supabase.from('mural_comments').delete().eq('id', commentId);
      if (error) throw error;
    } catch (err: any) {
      setComments(previousComments);
      toast({ title: "Erro ao excluir comentário", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 sm:gap-3 text-sm animate-in fade-in slide-in-from-left-1 duration-300">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/5 flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 border border-white/5">
              {comment.author_name.charAt(0)}
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-2 sm:p-3 relative group border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-300 text-[10px] sm:text-[11px]">{comment.author_name}</span>
                {(user?.id === comment.author_id || user?.role === 'admin') && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-[12px] text-gray-400">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 relative mt-4">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 bg-[#252525] border-none rounded-xl px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-white focus:ring-1 focus:ring-primary/30"
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <Button onClick={handleAddComment} size="sm" className="gold-gradient h-8 text-[10px] sm:text-[11px] rounded-lg px-3 sm:px-4">Enviar</Button>
      </div>
    </div>
  );
};

