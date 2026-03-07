import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Settings, UserCog, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppProfile {
  id: string;
  phone: string;
  name: string;
  proxy: string;
  status: "online" | "ban" | "relogin";
  todaySent: number;
  limit: number;
  totalSent: number;
  selected: boolean;
}

const initialProfiles: WhatsAppProfile[] = [
  { id: "1", phone: "77053975328", name: "Айка", proxy: "", status: "online", todaySent: 36, limit: 0, totalSent: 2888, selected: false },
  { id: "2", phone: "77002358625", name: "Айка", proxy: "", status: "online", todaySent: 0, limit: 0, totalSent: 1031, selected: false },
  { id: "3", phone: "77713567919", name: "", proxy: "", status: "online", todaySent: 21, limit: 0, totalSent: 34, selected: false },
  { id: "4", phone: "77083029250", name: "call center", proxy: "", status: "relogin", todaySent: 49, limit: 0, totalSent: 49, selected: false },
  { id: "5", phone: "77082877802", name: "", proxy: "", status: "online", todaySent: 28, limit: 0, totalSent: 28, selected: false },
  { id: "6", phone: "77002570488", name: "Call center", proxy: "", status: "online", todaySent: 16, limit: 0, totalSent: 16, selected: false },
  { id: "7", phone: "77059310511", name: "", proxy: "", status: "ban", todaySent: 2, limit: 0, totalSent: 2, selected: false },
];

function getAvatarNumber(phone: string) {
  const last2 = phone.slice(-2);
  return last2;
}

const Accounts = () => {
  const [profiles, setProfiles] = useState<WhatsAppProfile[]>(initialProfiles);
  const [addOpen, setAddOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newProxy, setNewProxy] = useState("");
  const [dayLimit, setDayLimit] = useState("");

  const onlineCount = profiles.filter((p) => p.status === "online").length;
  const banCount = profiles.filter((p) => p.status === "ban").length;
  const allSelected = profiles.every((p) => p.selected);
  const someSelected = profiles.some((p) => p.selected);

  const toggleAll = () => {
    const next = !allSelected;
    setProfiles((prev) => prev.map((p) => ({ ...p, selected: next })));
  };

  const toggleOne = (id: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const handleAdd = () => {
    if (!newPhone.trim()) return;
    const profile: WhatsAppProfile = {
      id: Date.now().toString(),
      phone: newPhone.trim(),
      name: newName.trim(),
      proxy: newProxy.trim(),
      status: "online",
      todaySent: 0,
      limit: 0,
      totalSent: 0,
      selected: false,
    };
    setProfiles((prev) => [...prev, profile]);
    setNewPhone("");
    setNewName("");
    setNewProxy("");
    setAddOpen(false);
  };

  const handleSetLimit = () => {
    const lim = parseInt(dayLimit) || 0;
    setProfiles((prev) =>
      prev.map((p) => (p.selected ? { ...p, limit: lim } : p))
    );
    setDayLimit("");
    setLimitOpen(false);
  };

  const handleDelete = () => {
    setProfiles((prev) => prev.filter((p) => !p.selected));
  };

  const statusBadge = (status: WhatsAppProfile["status"]) => {
    if (status === "online") return null;
    if (status === "ban")
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Ban</Badge>;
    return <span className="text-xs text-destructive">Требуется повторный вход</span>;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display font-bold">Аккаунты WhatsApp</h1>
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setAddOpen(true)}>
              <MessageCircle className="h-4 w-4 text-primary" />
              Add Whatsapp profile
            </Button>
          </div>

          {/* Main */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-display">Whatsapp Profiles</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  Online: {onlineCount} / Ban: {banCount}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b pb-3 mb-1">
                <div className="flex items-center gap-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  <span className="text-sm font-medium">Отметить все</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={!someSelected} onClick={() => setLimitOpen(true)}>
                    <Settings className="h-3.5 w-3.5 mr-1" /> Set limit
                  </Button>
                  <Button variant="outline" size="sm" disabled={!someSelected}>
                    <UserCog className="h-3.5 w-3.5 mr-1" /> Change profile
                  </Button>
                  <Button variant="outline" size="sm" disabled={!someSelected} onClick={handleDelete} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Column header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 py-2 border-b">
                <span>Phone/Имя/Proxy</span>
                <span>Сегодня/Limit/Всего</span>
              </div>

              {/* Profiles list */}
              <AnimatePresence>
                {profiles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between py-3 px-1 border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={p.selected} onCheckedChange={() => toggleOne(p.id)} />
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                        {getAvatarNumber(p.phone)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {p.phone}
                            {p.name && ` (${p.name})`}
                          </span>
                          {statusBadge(p.status)}
                        </div>
                        {p.proxy && (
                          <span className="text-xs text-muted-foreground">Proxy: {p.proxy}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {p.todaySent}/{p.limit}/{p.totalSent}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add profile dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить WhatsApp профиль</DialogTitle>
            <DialogDescription>Введите данные нового аккаунта</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Номер телефона" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <Input placeholder="Имя (необязательно)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Proxy (необязательно)" value={newProxy} onChange={(e) => setNewProxy(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set limit dialog */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Установить лимит</DialogTitle>
            <DialogDescription>Дневной лимит для выбранных профилей</DialogDescription>
          </DialogHeader>
          <Input type="number" placeholder="Day limit" value={dayLimit} onChange={(e) => setDayLimit(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLimitOpen(false)}>Отмена</Button>
            <Button onClick={handleSetLimit}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Accounts;
