import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, Send, CalendarIcon, Clock, Users, CheckCircle2, Pause, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  template: string;
  group: string;
  date: Date | null;
  time: string;
  status: "draft" | "scheduled" | "completed";
  contactsCount: number;
}

const initialCampaigns: Campaign[] = [
  { id: "1", name: "Акция выходного дня", template: "Акция", group: "Клиенты", date: new Date(2026, 2, 5), time: "10:00", status: "completed", contactsCount: 342 },
  { id: "2", name: "Новинки каталога", template: "Приветствие", group: "VIP", date: new Date(2026, 2, 8), time: "14:00", status: "scheduled", contactsCount: 891 },
  { id: "3", name: "Напоминание об оплате", template: "Напоминание", group: "Партнёры", date: null, time: "", status: "draft", contactsCount: 156 },
];

const templateOptions = ["Приветствие", "Акция", "Напоминание"];
const groupOptions = ["Клиенты", "VIP", "Партнёры"];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; badgeClass: string }> = {
  completed: { label: "Завершена", icon: CheckCircle2, badgeClass: "bg-accent text-accent-foreground" },
  scheduled: { label: "Запланирована", icon: Clock, badgeClass: "bg-wa-amber-light text-wa-amber" },
  draft: { label: "Черновик", icon: Pause, badgeClass: "bg-muted text-muted-foreground" },
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; template: string; group: string; date: Date | undefined; time: string }>({
    name: "", template: "", group: "", date: undefined, time: "10:00",
  });

  const handleCreate = () => {
    if (!form.name || !form.template || !form.group) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    const status = form.date ? "scheduled" : "draft";
    const contactsCount = Math.floor(Math.random() * 500) + 50;
    setCampaigns([
      ...campaigns,
      { id: Date.now().toString(), name: form.name, template: form.template, group: form.group, date: form.date || null, time: form.time, status, contactsCount },
    ]);
    setForm({ name: "", template: "", group: "", date: undefined, time: "10:00" });
    setDialogOpen(false);
    toast.success(status === "scheduled" ? "Рассылка запланирована" : "Черновик сохранён");
  };

  const handleDelete = (id: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
    toast.success("Рассылка удалена");
  };

  const byStatus = (s: string) => campaigns.filter((c) => c.status === s);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Рассылки</h1>
            <p className="text-muted-foreground mt-1">Планирование и управление кампаниями</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow gap-2">
                <Plus className="h-4 w-4" /> Новая рассылка
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Создать рассылку</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Название</Label>
                  <Input placeholder="Например: Весенняя акция" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Шаблон</Label>
                  <Select value={form.template} onValueChange={(v) => setForm({ ...form, template: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите шаблон" /></SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Группа контактов</Label>
                  <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите группу" /></SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Дата</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, "d MMM yyyy", { locale: ru }) : "Выбрать"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.date} onSelect={(d) => setForm({ ...form, date: d })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Время</Label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full gradient-primary text-primary-foreground">
                  {form.date ? "Запланировать" : "Сохранить черновик"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {(["scheduled", "draft", "completed"] as const).map((status) => {
          const items = byStatus(status);
          if (items.length === 0) return null;
          const cfg = statusConfig[status];
          return (
            <motion.div key={status} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                <cfg.icon className="h-5 w-5" /> {cfg.label} ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                          <Send className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.contactsCount} • {c.group}</span>
                            <span>• Шаблон: {c.template}</span>
                            {c.date && <span>• {format(c.date, "d MMM", { locale: ru })} в {c.time}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", cfg.badgeClass)}>{cfg.label}</Badge>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive h-8 w-8" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          );
        })}

        {campaigns.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-display">Нет рассылок</p>
            <p className="text-sm mt-1">Создайте первую рассылку, нажав кнопку выше</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
