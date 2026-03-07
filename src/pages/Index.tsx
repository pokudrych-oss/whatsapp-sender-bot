import { Users, MessageSquareText, Send, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { label: "Контакты", value: "1,247", icon: Users, change: "+12%", color: "text-primary" },
  { label: "Шаблоны", value: "23", icon: MessageSquareText, change: "+3", color: "text-wa-teal" },
  { label: "Рассылки", value: "8", icon: Send, change: "2 активных", color: "text-wa-emerald" },
  { label: "Доставлено", value: "94.2%", icon: TrendingUp, change: "+1.5%", color: "text-wa-amber" },
];

const recentCampaigns = [
  { name: "Акция выходного дня", status: "completed", contacts: 342, date: "5 мар" },
  { name: "Новинки каталога", status: "scheduled", contacts: 891, date: "8 мар" },
  { name: "Напоминание об оплате", status: "draft", contacts: 156, date: "—" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "Завершена", className: "bg-accent text-accent-foreground" },
  scheduled: { label: "Запланирована", className: "bg-wa-amber-light text-wa-amber" },
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
};

const Index = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">Дашборд</h1>
          <p className="text-muted-foreground mt-1">Обзор вашей системы рассылок</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Последние рассылки</CardTitle>
              <Link to="/campaigns" className="text-sm text-primary hover:underline">Все рассылки →</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCampaigns.map((c) => {
                  const st = statusMap[c.status];
                  return (
                    <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-3">
                        {c.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.contacts} контактов • {c.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
