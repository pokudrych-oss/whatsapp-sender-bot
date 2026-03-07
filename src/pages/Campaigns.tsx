import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ru } from "date-fns/locale";
import { Plus, CalendarIcon, Pause, Play, Trash2, MoreVertical, Download, Copy, Pencil, Archive } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  phone: string;
  message: string;
  group: string;
  nextAction: Date | null;
  nextActionTime: string;
  sent: number;
  pending: number;
  failed: number;
  isPaused: boolean;
}

const initialCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Keremet update go",
    phone: "77713567919",
    message: "Құрметті {{field_1}} сіздің қоқыс тасымалдау қызметіне, нақтылай айтқанда, жеке кәсіпкер «Керемет 2020» алдында қарызыңыз бар екенін ескертеміз.\n\nОсы жолдаманы алған күннен бастап 5 жұмыс күні ішінде мекеме алдындағы {{field_4}}тг қарызыңызды төлеуіңізді сұранамыз.\nСіздің тіркелген Мекен жайыңыз {{field_2}} Дербес шотыңыз: {{field_3}}\n\nУважаемый {{field_1}} сообщаем вам, что у вас имеется задолженность за услугу вывоза мусора, а именно перед ИП «Керемет 2020».\nПросим вас погасить задолженность в размере {{field_4}} в течение 5 рабочих дней с момента получения данного уведомления.",
    group: "Keremet update",
    nextAction: new Date(2026, 2, 8),
    nextActionTime: "08:00",
    sent: 57,
    pending: 466,
    failed: 1,
    isPaused: false,
  },
  {
    id: "2",
    name: "Акция весна 2026",
    phone: "77019998877",
    message: "Здравствуйте, {{field_1}}! Рады сообщить вам о весенней акции. Скидка {{field_2}}% на все услуги до конца марта!",
    group: "Клиенты VIP",
    nextAction: new Date(2026, 2, 10),
    nextActionTime: "10:00",
    sent: 120,
    pending: 340,
    failed: 3,
    isPaused: true,
  },
];

const subgroupData: Record<string, { variables: string[]; examples: Record<string, string> }> = {
  "Keremet update": {
    variables: ["field_1", "field_2", "field_3", "field_4"],
    examples: { field_1: "Ахметов Б.К.", field_2: "ул. Абая 12", field_3: "KR-00457", field_4: "15200" },
  },
  "VIP клиенты": {
    variables: ["field_1", "field_2"],
    examples: { field_1: "Иванов А.С.", field_2: "20" },
  },
  "Новые партнёры": {
    variables: ["field_1", "field_2", "field_3"],
    examples: { field_1: "ТОО Альфа", field_2: "Астана", field_3: "partnership" },
  },
  "Рассылка март": {
    variables: ["field_1"],
    examples: { field_1: "+77001234567" },
  },
};
const subgroupOptions = Object.keys(subgroupData);
const phoneOptions = ["77053975328", "77002358625", "77713567919", "77083029250", "77082877802", "77002570488"];

const SubgroupVariableInfo = ({ groupName }: { groupName: string }) => {
  const data = subgroupData[groupName];
  if (!data) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Переменные подгруппы</span>
        <Badge variant="secondary" className="text-xs">{data.variables.length} перем.</Badge>
      </div>
      <div className="space-y-1">
        {data.variables.map((v) => (
          <div key={v} className="flex items-center justify-between text-sm">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{`{{${v}}}`}</code>
            <span className="text-xs text-muted-foreground truncate ml-2">{data.examples[v]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(campaigns[0]?.id || null);
  const [form, setForm] = useState({
    name: "", phone: "", message: "", group: "", date: undefined as Date | undefined, time: "08:00",
    minInterval: "600", maxInterval: "1200", sendFrom: "8:00", sendTo: "20:00",
  });
  const [editForm, setEditForm] = useState({
    name: "", phone: "", message: "", group: "", date: undefined as Date | undefined, time: "08:00",
    minInterval: "600", maxInterval: "1200", sendFrom: "8:00", sendTo: "20:00",
  });

  const selected = campaigns.find((c) => c.id === selectedId) || null;

  const openEditDialog = (c: Campaign) => {
    setEditingId(c.id);
    setEditForm({
      name: c.name, phone: c.phone, message: c.message, group: c.group,
      date: c.nextAction || undefined, time: c.nextActionTime,
      minInterval: "600", maxInterval: "1200", sendFrom: "8:00", sendTo: "20:00",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editForm.name || !editForm.phone || !editForm.message || !editForm.group) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    setCampaigns(prev => prev.map(c => c.id === editingId ? {
      ...c, name: editForm.name, phone: editForm.phone, message: editForm.message,
      group: editForm.group, nextAction: editForm.date || null, nextActionTime: editForm.time,
    } : c));
    setEditDialogOpen(false);
    setEditingId(null);
    toast.success("Рассылка обновлена");
  };

  const handleCreate = () => {
    if (!form.name || !form.phone || !form.message || !form.group) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: form.name,
      phone: form.phone,
      message: form.message,
      group: form.group,
      nextAction: form.date || null,
      nextActionTime: form.time,
      sent: 0,
      pending: 0,
      failed: 0,
      isPaused: true,
    };
    setCampaigns([...campaigns, newCampaign]);
    setSelectedId(newCampaign.id);
    setForm({ name: "", phone: "", message: "", group: "", date: undefined, time: "08:00", minInterval: "600", maxInterval: "1200", sendFrom: "8:00", sendTo: "20:00" });
    setDialogOpen(false);
    toast.success("Рассылка создана");
  };

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(campaigns.find((c) => c.id !== id)?.id || null);
    toast.success("Рассылка удалена");
  };

  const togglePause = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, isPaused: !c.isPaused } : c));
  };

  const total = (c: Campaign) => c.sent + c.pending + c.failed;
  const progress = (c: Campaign) => total(c) > 0 ? (c.sent / total(c)) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Рассылки</h1>
            <p className="text-muted-foreground mt-1">Управление кампаниями</p>
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
                  <Input placeholder="Например: Keremet update go" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Номер телефона отправителя</Label>
                  <Select value={form.phone} onValueChange={(v) => setForm({ ...form, phone: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите номер" /></SelectTrigger>
                    <SelectContent>
                      {phoneOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Текст рассылки</Label>
                  <Textarea
                    placeholder="Используйте {{field_1}}, {{field_2}} для переменных..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label>Подгруппа контактов</Label>
                  <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите подгруппу" /></SelectTrigger>
                    <SelectContent>
                      {subgroupOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Запланировать рассылку</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, "dd/MM/yyyy", { locale: ru }) : "Дата"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.date} onSelect={(d) => setForm({ ...form, date: d })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-28" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Минимальный интервал между сообщениями (секунд)</Label>
                    <Input type="number" value={form.minInterval} onChange={(e) => setForm({ ...form, minInterval: e.target.value })} />
                  </div>
                  <div>
                    <Label>Максимальный интервал между сообщениями (секунд)</Label>
                    <Input type="number" value={form.maxInterval} onChange={(e) => setForm({ ...form, maxInterval: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Отправка с:</Label>
                    <Input type="time" value={form.sendFrom} onChange={(e) => setForm({ ...form, sendFrom: e.target.value })} />
                  </div>
                  <div>
                    <Label>Отправка до:</Label>
                    <Input type="time" value={form.sendTo} onChange={(e) => setForm({ ...form, sendTo: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full gradient-primary text-primary-foreground">
                  Создать рассылку
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Campaign list */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
          {/* Sidebar list */}
          <div className="space-y-2">
            <AnimatePresence>
              {campaigns.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedId === c.id && "ring-2 ring-primary shadow-md"
                    )}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-display font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); togglePause(c.id); }}
                          >
                            {c.isPaused ? <Play className="h-3.5 w-3.5 text-primary" /> : <Pause className="h-3.5 w-3.5 text-wa-amber" />}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={progress(c)} className="h-1.5" />
                        <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                          <span className="text-primary font-medium">{c.sent} sent</span>
                          <span>{c.pending} pending</span>
                          {c.failed > 0 && <span className="text-destructive">{c.failed} failed</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {campaigns.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Нет рассылок
              </div>
            )}
          </div>

          {/* Detail view */}
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-0"
            >
              <Card className="overflow-hidden">
                {/* Header bar */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-lg">{selected.name}</h2>
                    <p className="text-primary-foreground/80 text-sm">{selected.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                      onClick={() => togglePause(selected.id)}
                    >
                      {selected.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          const clone: Campaign = { ...selected, id: Date.now().toString(), name: selected.name + " (копия)", sent: 0, pending: selected.sent + selected.pending + selected.failed, failed: 0, isPaused: true };
                          setCampaigns(prev => [...prev, clone]);
                          setSelectedId(clone.id);
                          toast.success("Рассылка клонирована");
                        }}>
                          <Copy className="h-4 w-4 mr-2" /> Клонировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(selected)}>
                          <Pencil className="h-4 w-4 mr-2" /> Изменить
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={selected.pending > 0}
                          onClick={() => {
                            handleDelete(selected.id);
                            toast.success("Рассылка архивирована");
                          }}
                        >
                          <Archive className="h-4 w-4 mr-2" /> Архивировать
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Message body */}
                <CardContent className="p-5">
                  <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap border border-border">
                    {selected.message}
                  </div>
                </CardContent>

                {/* Footer bar */}
                <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">Подгруппа</p>
                    <p className="font-display font-semibold text-sm">{selected.group}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">Next action</p>
                    <p className="font-display font-semibold text-sm">
                      {selected.nextAction
                        ? `${format(selected.nextAction, "dd/MM/yyyy")} ${selected.nextActionTime}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="text-center py-4">
                    <p className="text-2xl font-display font-bold text-primary">{selected.sent}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Sent</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-2xl font-display font-bold text-foreground">{selected.pending}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Pending</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-2xl font-display font-bold text-destructive">{selected.failed}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Failed</p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleDelete(selected.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Удалить
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-sm py-20">
              Выберите рассылку из списка
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Изменить рассылку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Название</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Номер телефона отправителя</Label>
                <Select value={editForm.phone} onValueChange={(v) => setEditForm({ ...editForm, phone: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите номер" /></SelectTrigger>
                  <SelectContent>
                    {phoneOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Текст рассылки</Label>
                <Textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label>Подгруппа контактов</Label>
                <Select value={editForm.group} onValueChange={(v) => setEditForm({ ...editForm, group: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите подгруппу" /></SelectTrigger>
                  <SelectContent>
                    {subgroupOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Запланировать рассылку</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !editForm.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editForm.date ? format(editForm.date, "dd/MM/yyyy", { locale: ru }) : "Дата"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={editForm.date} onSelect={(d) => setEditForm({ ...editForm, date: d })} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-28" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Минимальный интервал (секунд)</Label>
                  <Input type="number" value={editForm.minInterval} onChange={(e) => setEditForm({ ...editForm, minInterval: e.target.value })} />
                </div>
                <div>
                  <Label>Максимальный интервал (секунд)</Label>
                  <Input type="number" value={editForm.maxInterval} onChange={(e) => setEditForm({ ...editForm, maxInterval: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Отправка с:</Label>
                  <Input type="time" value={editForm.sendFrom} onChange={(e) => setEditForm({ ...editForm, sendFrom: e.target.value })} />
                </div>
                <div>
                  <Label>Отправка до:</Label>
                  <Input type="time" value={editForm.sendTo} onChange={(e) => setEditForm({ ...editForm, sendTo: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleEdit} className="w-full gradient-primary text-primary-foreground">
                Сохранить изменения
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
