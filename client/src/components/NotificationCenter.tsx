import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, AppNotification, NotificationType } from "@/contexts/NotificationContext";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  FileText,
  Bike,
  Store,
  ShieldAlert,
  CheckCircle2,
  Receipt,
  Sparkles,
  ExternalLink
} from "lucide-react";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "quote_ready":
      return <Receipt className="w-4 h-4 text-emerald-600" />;
    case "order_status":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "rider_dispatch":
      return <Bike className="w-4 h-4 text-amber-600" />;
    case "pickup_ready":
      return <Store className="w-4 h-4 text-teal-600" />;
    case "delivery_complete":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "system_alert":
    default:
      return <ShieldAlert className="w-4 h-4 text-indigo-600" />;
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case "patient":
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">PATIENT</span>;
    case "pharmacy":
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800">PHARMACY</span>;
    case "rider":
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">DELIVERY</span>;
    case "admin":
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300">ADMIN</span>;
    default:
      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">ALL</span>;
  }
}

export function NotificationCenter() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const {
    notifications,
    getRoleNotifications,
    getRoleUnreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"for_you" | "all">("for_you");

  const normalizedRole: UserRole = user.role === "customer" ? "patient" : user.role;
  const roleNotifs = getRoleNotifications(normalizedRole);
  const unreadCount = getRoleUnreadCount(normalizedRole);

  const displayNotifs = activeTab === "for_you" ? roleNotifs : notifications;

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.actionUrl) {
      setLocation(item.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Notifications"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 bg-white shadow-2xs"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden text-slate-900 z-50"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-rose-500 text-white border-none text-[9px] px-1.5 py-0 font-bold rounded-full">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-slate-500 capitalize">
                Active role: <strong className="text-slate-700">{normalizedRole}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => markAllAsRead(activeTab === "for_you" ? normalizedRole : undefined)}
              title="Mark all as read"
              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark read</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 pt-2 pb-1 bg-white border-b border-slate-100">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg h-7">
              <TabsTrigger
                value="for_you"
                className="text-[11px] font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-2xs cursor-pointer py-0.5"
              >
                For You ({roleNotifs.length})
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="text-[11px] font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-2xs cursor-pointer py-0.5"
              >
                All Events ({notifications.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List of Notifications */}
        <ScrollArea className="max-h-[340px] divide-y divide-slate-100">
          {displayNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400">
                You will be notified when orders, quotes, or dispatches update.
              </p>
            </div>
          ) : (
            displayNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 transition-colors cursor-pointer text-left hover:bg-slate-50 flex gap-3 ${
                  !item.read ? "bg-emerald-50/40" : "bg-white"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    {getNotificationIcon(item.type)}
                  </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getRoleBadge(item.role)}
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400 font-medium">
                    <span>{item.timestamp}</span>
                    {item.orderId && (
                      <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1 rounded">
                        #{item.orderId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        {displayNotifs.length > 0 && (
          <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
            <button
              onClick={() => clearNotifications(activeTab === "for_you" ? normalizedRole : undefined)}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear list</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium pr-2">
              Auto-syncs across tabs
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

