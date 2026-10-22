// import { Request, Response } from "express"; 
// import { notificationServices } from "./notification.service"; 
// import catchAsync from "../../helpers/catchAsync";
// import sendResponse from "../../helpers/sendResponse";

// const getNotificationsFrom = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user.id as string;
//   const result = await notificationServices.getNotificationsFromDB(userId);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Notification retrieved successfully",
//     data: result,
//   });
// });

// export const notificationController = {
//   getNotificationsFrom,
// };



























import { Request, Response } from "express"; 
import { notificationServices } from "./notification.service"; 
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import eventEmitter from "../../sse/eventEmitter"; 

const sendSingleNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const result = await notificationServices.sendSingleNotification({
    id: userId,
    body: req.body.message,
    title: req.body.title, 
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification retrieved successfully",
    data: result,
  });
});


const getNotificationsFrom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const result = await notificationServices.getNotificationsFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification retrieved successfully",
    data: result,
  });
});


const getNotificationsCount = catchAsync(
  async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write("event: connected\n");
    res.write(`data: Connected to notifications\n\n`);
    res.flushHeaders();
    const userId = req.params.id as string;
    const initialCount = await notificationServices.getNotificationsCount(
      userId
    );

    res.write(`event:notification-count\ndata: ${JSON.stringify({ count: initialCount })}\n\n`);

    const listener = async (receiverId: string) => {
      console.log(receiverId,"check receiver id")
      if (userId === receiverId) {
          console.log("inside if condition to check ")
        const count = await notificationServices.getNotificationsCount(userId);

        res.write(`event:notification-count\ndata: ${JSON.stringify({ count })}\n\n`);
      }
    };

    eventEmitter.on(`event:notification-count`, listener);

    const pingInterval = setInterval(() => {
      res.write("event: ping\n");
      res.write("data: keep-alive\n\n");
    }, 25000);

    // Cleanup on disconnect
    req.on("close", () => {
      clearInterval(pingInterval);
      eventEmitter.off("event:notification-count", listener);
      res.end();
    });
  }
);

const readNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await notificationServices.markNotificationsAsRead(id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markBulkNotificationsAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const result = await notificationServices.markBulkNotificationsAsRead(
      req.user.id
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "bulk Notification marked as read",
      data: result,
    });
  }
);

export const notificationController = {
  sendSingleNotification,
  getNotificationsFrom,
  getNotificationsCount,
  readNotification,
  markBulkNotificationsAsRead,
};