import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications for current user
  const { data: notifications = [], refetch } = trpc.notifications.getByUser.useQuery();

  // Mark notification as read
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Delete notification
  const deleteNotificationMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Update unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleDelete = (id: number) => {
    deleteNotificationMutation.mutate({ id });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan_approved":
      case "book_loan_approved":
        return "✓";
      case "loan_rejected":
      case "book_loan_rejected":
        return "✗";
      case "loan_pending":
      case "book_loan_pending":
        return "⏳";
      case "loan_returned":
      case "book_loan_returned":
        return "↩";
      default:
        return "•";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "loan_approved":
      case "book_loan_approved":
        return "bg-green-50 border-green-200";
      case "loan_rejected":
      case "book_loan_rejected":
        return "bg-red-50 border-red-200";
      case "loan_pending":
      case "book_loan_pending":
        return "bg-yellow-50 border-yellow-200";
      case "loan_returned":
      case "book_loan_returned":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Notificações</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma notificação
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${getNotificationColor(
                      notification.type
                    )} ${!notification.isRead ? "border-l-4 border-l-blue-500" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
