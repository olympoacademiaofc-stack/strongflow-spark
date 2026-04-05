import { AppLayout } from "@/components/AppLayout";
import { MuralSection } from "@/components/MuralSection";

const Timeline = () => {
  return (
    <AppLayout>
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold">Mural da Comunidade</h1>
          <p className="text-muted-foreground mt-1">
            Espaço de interação e avisos oficiais da Olympo
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <MuralSection />
        </div>
      </div>
    </AppLayout>
  );
};

export default Timeline;

