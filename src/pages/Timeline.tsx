import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Pin, Image as ImageIcon } from "lucide-react";

const mockPosts = [
  {
    id: 1,
    author: "Academia OLIMPO",
    avatar: "O",
    isAdmin: true,
    pinned: true,
    content: "🏋️ PROMOÇÃO DE VERÃO! Matrícula com 50% de desconto até o final do mês. Traga um amigo e ganhe 1 mês grátis!",
    likes: 24,
    comments: 8,
    time: "2h atrás",
    image: null,
  },
  {
    id: 2,
    author: "Carlos Silva",
    avatar: "C",
    isAdmin: false,
    pinned: false,
    content: "Mais um dia de treino pesado! 💪 Bora superar os limites!",
    likes: 15,
    comments: 3,
    time: "4h atrás",
    image: null,
  },
  {
    id: 3,
    author: "Academia OLIMPO",
    avatar: "O",
    isAdmin: true,
    pinned: true,
    content: "📢 EVENTO: Aulão especial de Cross Training neste sábado às 9h! Vagas limitadas, faça seu check-in pelo app.",
    likes: 32,
    comments: 12,
    time: "1 dia atrás",
    image: null,
  },
  {
    id: 4,
    author: "Ana Oliveira",
    avatar: "A",
    isAdmin: false,
    pinned: false,
    content: "3 meses de treino e já vejo os resultados! Obrigada equipe OLIMPO! 🔥",
    likes: 42,
    comments: 6,
    time: "1 dia atrás",
    image: null,
  },
];

const Timeline = () => {
  const [novoPost, setNovoPost] = useState("");
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (id: number) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Timeline</h1>
          <p className="text-muted-foreground mt-1">Feed da comunidade</p>
        </div>

        {/* New post */}
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold shrink-0">
              A
            </div>
            <Input
              placeholder="Compartilhe algo com a comunidade..."
              value={novoPost}
              onChange={(e) => setNovoPost(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Foto
            </Button>
            <Button size="sm" className="gold-gradient text-primary-foreground">
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Posts */}
        {posts
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
          .map((post) => (
            <div key={post.id} className="stat-card space-y-4">
              {post.pinned && (
                <div className="flex items-center gap-1 text-primary text-xs font-medium">
                  <Pin className="h-3 w-3" />
                  Fixado
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    post.isAdmin
                      ? "gold-gradient text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {post.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {post.author}
                    {post.isAdmin && (
                      <span className="ml-2 text-xs text-primary font-normal">Admin</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </button>
              </div>
            </div>
          ))}
      </div>
    </AppLayout>
  );
};

export default Timeline;
