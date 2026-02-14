import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const turmas = [
  {
    id: 1,
    modalidade: "Musculação",
    horario: "06:00 - 07:00",
    instrutor: "Prof. Ricardo",
    vagas: 30,
    ocupadas: 18,
    status: "aberta",
  },
  {
    id: 2,
    modalidade: "Funcional",
    horario: "07:00 - 08:00",
    instrutor: "Prof. Amanda",
    vagas: 30,
    ocupadas: 25,
    status: "aberta",
  },
  {
    id: 3,
    modalidade: "Cross Training",
    horario: "08:00 - 09:00",
    instrutor: "Prof. Diego",
    vagas: 30,
    ocupadas: 30,
    status: "lotada",
  },
  {
    id: 4,
    modalidade: "Dança",
    horario: "09:00 - 10:00",
    instrutor: "Prof. Carla",
    vagas: 30,
    ocupadas: 12,
    status: "aberta",
  },
  {
    id: 5,
    modalidade: "Musculação",
    horario: "17:00 - 18:00",
    instrutor: "Prof. Ricardo",
    vagas: 30,
    ocupadas: 22,
    status: "aberta",
  },
  {
    id: 6,
    modalidade: "Personal",
    horario: "18:00 - 19:00",
    instrutor: "Prof. Bruno",
    vagas: 1,
    ocupadas: 0,
    status: "aberta",
  },
];

const Checkin = () => {
  const { toast } = useToast();
  const [checkins, setCheckins] = useState<number[]>([]);

  const handleCheckin = (id: number) => {
    if (checkins.includes(id)) return;
    setCheckins([...checkins, id]);
    toast({
      title: "Check-in realizado!",
      description: "Presença confirmada com sucesso.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Check-in</h1>
          <p className="text-muted-foreground mt-1">Turmas disponíveis hoje</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map((turma) => {
            const isLotada = turma.status === "lotada";
            const isChecked = checkins.includes(turma.id);
            const percentOcupado = (turma.ocupadas / turma.vagas) * 100;

            return (
              <div key={turma.id} className="stat-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg">{turma.modalidade}</h3>
                  {isLotada ? (
                    <Badge variant="outline" className="bg-danger/20 text-danger border-danger/30">
                      Lotada
                    </Badge>
                  ) : isChecked ? (
                    <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                      Confirmado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      Disponível
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {turma.horario}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {turma.ocupadas}/{turma.vagas} vagas
                  </div>
                  <p>{turma.instrutor}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentOcupado}%`,
                      background:
                        percentOcupado >= 100
                          ? "hsl(0, 72%, 51%)"
                          : percentOcupado >= 80
                          ? "hsl(38, 92%, 50%)"
                          : "hsl(43, 75%, 49%)",
                    }}
                  />
                </div>

                <Button
                  onClick={() => handleCheckin(turma.id)}
                  disabled={isLotada || isChecked}
                  className={`w-full ${
                    isChecked
                      ? "bg-success/20 text-success border border-success/30"
                      : "gold-gradient text-primary-foreground"
                  }`}
                  variant={isChecked ? "outline" : "default"}
                >
                  {isChecked ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Check-in Feito
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Fazer Check-in
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Checkin;
