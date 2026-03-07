import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, UserPlus, Users, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone: string;
  group: string;
}

const initialContacts: Contact[] = [
  { id: "1", name: "Алексей Иванов", phone: "+7 900 123-45-67", group: "Клиенты" },
  { id: "2", name: "Мария Петрова", phone: "+7 911 234-56-78", group: "VIP" },
  { id: "3", name: "Дмитрий Сидоров", phone: "+7 925 345-67-89", group: "Клиенты" },
  { id: "4", name: "Елена Козлова", phone: "+7 903 456-78-90", group: "Партнёры" },
  { id: "5", name: "Сергей Морозов", phone: "+7 916 567-89-01", group: "VIP" },
];

const groups = ["Все", "Клиенты", "VIP", "Партнёры"];

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Все");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", group: "Клиенты" });

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchGroup = filterGroup === "Все" || c.group === filterGroup;
    return matchSearch && matchGroup;
  });

  const handleAdd = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Заполните имя и номер телефона");
      return;
    }
    setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
    setNewContact({ name: "", phone: "", group: "Клиенты" });
    setDialogOpen(false);
    toast.success("Контакт добавлен");
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success("Контакт удалён");
  };

  const groupCounts = groups.slice(1).map((g) => ({
    name: g,
    count: contacts.filter((c) => c.group === g).length,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Контакты</h1>
            <p className="text-muted-foreground mt-1">{contacts.length} контактов в базе</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow gap-2">
                <UserPlus className="h-4 w-4" /> Добавить контакт
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Новый контакт</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Имя</Label>
                  <Input placeholder="Иван Иванов" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input placeholder="+7 900 000-00-00" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Группа</Label>
                  <Select value={newContact.group} onValueChange={(v) => setNewContact({ ...newContact, group: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {groups.slice(1).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full gradient-primary text-primary-foreground">Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {groupCounts.map((g, i) => (
            <motion.div key={g.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterGroup(g.name)}>
                <CardContent className="pt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{g.name}</p>
                    <p className="text-xl font-display font-bold">{g.count}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Поиск по имени или номеру…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Контакты не найдены</p>
              )}
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{c.group}</Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
