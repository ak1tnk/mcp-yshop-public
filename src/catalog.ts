/* Official API inventory checked 2026-11-04. Identifiers and routes only; no authentication values. */
export const apiCatalog = {
  "orderCount": {
    "title": "注文ステータス別件数参照API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderCount",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderCount.html",
    "parameters": [
      "sellerId"
    ],
    "required": []
  },
  "orderList": {
    "title": "注文検索API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderList",
    "method": "POST",
    "encoding": "xml",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderList.html",
    "parameters": [
      "Search",
      "Search/Result",
      "Search/Start",
      "Search/Sort",
      "Search/Condition",
      "Search/Condition/",
      "Search/Field",
      "SellerId",
      "postageN",
      "y123456789"
    ],
    "required": [
      "Search/Field"
    ]
  },
  "orderInfo": {
    "title": "注文詳細API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderInfo",
    "method": "POST",
    "encoding": "xml",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderInfo.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/Field",
      "SellerId",
      "au",
      "other",
      "y123456789",
      "postageN",
      "Null"
    ],
    "required": [
      "Target/OrderId",
      "Target/Field"
    ]
  },
  "orderStatusChange": {
    "title": "注文ステータス変更API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderStatusChange",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderStatusChange.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/IsPointFix",
      "Target/OperationUser",
      "Order",
      "Order/OrderStatus",
      "SellerId",
      "Order/CancelReason",
      "Oeder/CancelReasonDetail"
    ],
    "required": [
      "Target/OrderId",
      "Target/IsPointFix",
      "Order/OrderStatus"
    ]
  },
  "orderPayStatusChange": {
    "title": "入金ステータス変更API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderPayStatusChange",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderPayStatusChange.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/OperationUser",
      "Order",
      "Order/Pay",
      "Order/Pay/PayStatus",
      "Order/Pay/PayDate",
      "SellerId"
    ],
    "required": [
      "Target/OrderId",
      "Order/Pay/PayStatus"
    ]
  },
  "orderShipStatusChange": {
    "title": "出荷ステータス変更API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderShipStatusChange",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderShipStatusChange.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/IsPointFix",
      "Target/OperationUser",
      "Order",
      "Order/Ship",
      "Order/Ship/ShipStatus",
      "Order/Ship/ShipMethod",
      "Order/Ship/ShipNotes",
      "Order/Ship/ShipCompanyCode",
      "Order/Ship/ShipInvoiceNumber1",
      "Order/Ship/ShipInvoiceNumber2",
      "Order/Ship/ShipInvoiceNumberEmptyReason",
      "Order/Ship/ShipUrl",
      "Order/Ship/ShipDate",
      "Order/Ship/ArrivalDate",
      "Order/Ship/ShipInstructStatus",
      "Order/Ship/CollectionDate",
      "Order/Ship/CashOnDeliveryTax",
      "Order/Ship/IsEazy",
      "Order/Ship/EazyDeliveryCode",
      "Order/Ship/EazyDeliveryName",
      "Order/Ship/IsMallContactlessDelivery",
      "SellerId"
    ],
    "required": [
      "Target/OrderId",
      "Target/IsPointFix",
      "Order/Ship/ShipStatus"
    ]
  },
  "orderChange": {
    "title": "注文内容変更API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderChange",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderChange.html",
    "parameters": [
      "SellerId",
      "Target",
      "Target/OrderId",
      "Target/IsPointFix",
      "Target/OperationUser",
      "Order",
      "Order/",
      "Order/Pay",
      "Order/Pay/",
      "Order/Ship",
      "Order/Ship/",
      "Order/Detail",
      "Order/Detail/",
      "Order/Item",
      "Order/Item/LineId",
      "Order/Item/",
      "IsCouponUpdateAllowed",
      "postageN"
    ],
    "required": [
      "Target/OrderId"
    ]
  },
  "orderChangeHistory": {
    "title": "注文操作履歴一覧API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderChangeHistory",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderChangeHistory.html",
    "parameters": [
      "orderId",
      "sellerId"
    ],
    "required": [
      "orderId"
    ]
  },
  "orderSplit": {
    "title": "注文分割API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderSplit",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderSplit.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/OperationUser",
      "Order",
      "Order/SplitId",
      "Order/Detail",
      "Order/Detail/PayCharge",
      "Order/Detail/ShipCharge",
      "Order/Detail/GiftWrapCharge",
      "Order/Detail/Discount",
      "Order/Detail/UsePoint",
      "Order/Item",
      "Order/Item/LineId",
      "Order/Item/Quantity",
      "SellerId"
    ],
    "required": [
      "Target/OrderId",
      "Target/OperationUser",
      "Order/SplitId",
      "Order/Detail/PayCharge",
      "Order/Detail/ShipCharge",
      "Order/Detail/GiftWrapCharge",
      "Order/Detail/Discount",
      "Order/Detail/UsePoint",
      "Order/Item/LineId",
      "Order/Item/Quantity"
    ]
  },
  "orderItemAdd": {
    "title": "注文ライン追加API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderItemAdd",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderItemAdd.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/IsQuotation",
      "Target/OperationUser",
      "Order",
      "Order/Item",
      "Order/Item/LineId",
      "Order/Item/ItemId",
      "Order/Item/Title",
      "Order/Item/IsQuotation",
      "Order/Item/SubCode",
      "Order/Item/ItemOption",
      "Order/Item/ItemOption/Index",
      "Order/Item/ItemOption/Name",
      "Order/Item/ItemOption/Value",
      "Order/Item/Inscription",
      "Order/Item/Inscription/Index",
      "Order/Item/Inscription/Name",
      "Order/Item/Inscription/Value",
      "Order/Item/UnitPrice",
      "Order/Item/Quantity",
      "SellerId"
    ],
    "required": [
      "Target",
      "Target/OrderId",
      "Target/IsQuotation",
      "Order/Item/LineId",
      "Order/Item/ItemId",
      "Order/Item/Quantity"
    ]
  },
  "orderPayNumber": {
    "title": "支払番号発行API",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderPayNumber",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderPayNumber.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/OperationUser",
      "SellerId"
    ],
    "required": [
      "Target/OrderId"
    ]
  },
  "orderCouponCancel": {
    "title": "クーポンキャンセルAPI",
    "group": "order",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/orderCouponCancel",
    "method": "POST",
    "encoding": "xml",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "SellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/orderCouponCancel.html",
    "parameters": [
      "Target",
      "Target/OrderId",
      "Target/OperationUser",
      "SellerId"
    ],
    "required": [
      "Target/OrderId"
    ]
  },
  "subscriptionOriginCount": {
    "title": "定期購入価格別件数取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/item/{item_id}/origincount",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/origincount.html",
    "parameters": [],
    "required": [],
    "notes": "表のselleridはサンプルURLのsellerIdとして送信。"
  },
  "subscriptionOriginList": {
    "title": "定期購入親注文一覧取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/list",
    "method": "POST",
    "encoding": "json",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/list.html",
    "parameters": [
      "sellerId",
      "countFrom",
      "countTo",
      "sort",
      "conditions"
    ],
    "required": []
  },
  "subscriptionReplicaList": {
    "title": "定期購入子注文一覧取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/replica/list",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/replica.html",
    "parameters": [
      "sellerId"
    ],
    "required": []
  },
  "subscriptionOriginDetail": {
    "title": "定期購入親注文詳細取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/detail.html",
    "parameters": [
      "sellerId"
    ],
    "required": []
  },
  "subscriptionSkip": {
    "title": "定期購入次回注文スキップAPI",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/skip",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/skip.html",
    "parameters": [
      "sellerId",
      "subscriptionReplicaId"
    ],
    "required": [
      "subscriptionReplicaId"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionCancelMulti": {
    "title": "定期購入親注文一括解約API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/cancel",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/cancelmulti.html",
    "parameters": [
      "sellerId",
      "cancelReason",
      "cancelReasonDetail",
      "targets",
      "subscriptionId"
    ],
    "required": [
      "cancelReason",
      "targets"
    ],
    "jsonSuccess": "results",
    "notes": "リクエストURL欄はorigin/cancel、サンプルはorigins/cancel。URL欄の単数originを使用。本番更新は未実行。"
  },
  "subscriptionCancel": {
    "title": "定期購入親注文解約API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/cancel",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/cancel.html",
    "parameters": [
      "sellerId",
      "cancelReason",
      "cancelReasonDetail",
      "subscriptionReplicaId"
    ],
    "required": [
      "cancelReason",
      "subscriptionReplicaId"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionShipDate": {
    "title": "定期購入お届け予定日変更API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/shipdate",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": null,
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/shipdate.html",
    "parameters": [
      "subscriptionReplicaId",
      "nextShipDate"
    ],
    "required": [
      "subscriptionReplicaId",
      "nextShipDate"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionChange": {
    "title": "定期購入情報変更API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/change",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/change.html",
    "parameters": [
      "subscriptionReplicaId",
      "changes"
    ],
    "required": [
      "subscriptionReplicaId",
      "changes"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionHistoryList": {
    "title": "定期購入情報変更履歴一覧API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/changehistory/list",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/historylist.html",
    "parameters": [
      "sellerId"
    ],
    "required": []
  },
  "subscriptionHistory": {
    "title": "定期購入情報変更履歴詳細API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/origin/{subscription_id}/changehistory/{history_id}",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/history.html",
    "parameters": [
      "sellerId"
    ],
    "required": []
  },
  "subscriptionChangeRequest": {
    "title": "定期購入変更要求登録API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequest.html",
    "parameters": [
      "sellerId",
      "changeRequestType",
      "targetItemId",
      "afterItemId",
      "subscriptionId",
      "lineId"
    ],
    "required": [
      "changeRequestType",
      "targetItemId",
      "subscriptionId",
      "lineId"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionChangeRequestCancel": {
    "title": "定期購入変更要求キャンセルAPI",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest/{changeRequestId}/cancel",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestcancel.html",
    "parameters": [
      "sellerId",
      "subscriptionId",
      "lineId"
    ],
    "required": [
      "subscriptionId",
      "lineId"
    ],
    "jsonSuccess": "result"
  },
  "subscriptionChangeRequestBulk": {
    "title": "定期購入変更要求一括登録API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest/bulk",
    "method": "PATCH",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestbulk.html",
    "parameters": [
      "changeRequestType",
      "targetItemId"
    ],
    "required": [
      "changeRequestType",
      "targetItemId"
    ],
    "jsonSuccess": "changeRequestId"
  },
  "subscriptionChangeRequestCancelBulk": {
    "title": "定期購入変更要求一括キャンセルAPI",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest/{changeRequestId}/cancel/bulk",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestcancelbulk.html",
    "parameters": [],
    "required": [],
    "jsonSuccess": "result"
  },
  "subscriptionChangeRequestList": {
    "title": "定期購入変更要求一覧取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest/list",
    "method": "POST",
    "encoding": "json",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestlist.html",
    "parameters": [],
    "required": [],
    "notes": "本文はPOST、サンプルはPATCH。本文のPOSTを使用し、2026-11-04の実接続で検索成功を確認。"
  },
  "subscriptionChangeRequestDetail": {
    "title": "定期購入変更要求詳細一覧取得API",
    "group": "subscription",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/subscription/order/changerequest/{change_request_id}",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestlistinfo.html",
    "parameters": [],
    "required": [],
    "notes": "本文はGET、サンプルはPATCH。本文のGETを使用。"
  },
  "editItem": {
    "title": "商品登録API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/editItem",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/editItem.html",
    "parameters": [],
    "required": [
      "item_code",
      "path",
      "name",
      "product_category",
      "price"
    ],
    "notes": "省略した商品項目を初期値で上書きする全体保存。部分変更にはupdateItemsを使用。"
  },
  "updateItems": {
    "title": "商品一括更新API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/updateItems",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/updateItems.html",
    "parameters": [
      "seller_id",
      "item1"
    ],
    "required": [
      "item1"
    ]
  },
  "moveItems": {
    "title": "商品移動API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/moveItems",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/moveItems.html",
    "parameters": [
      "seller_id",
      "item_code",
      "from_stcat_key",
      "to_stcat_key",
      "mode"
    ],
    "required": [
      "item_code",
      "from_stcat_key",
      "to_stcat_key"
    ]
  },
  "setItemDisplayPriority": {
    "title": "商品表示優先順変更API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/setItemDisplayPriority",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/setItemDisplayPriority.html",
    "parameters": [
      "seller_id",
      "stcat_key",
      "sort_priority_list"
    ],
    "required": [
      "stcat_key",
      "sort_priority_list"
    ]
  },
  "getItem": {
    "title": "商品参照API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getItem",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getItem.html",
    "parameters": [
      "seller_id",
      "item_code",
      "expand_spec"
    ],
    "required": [
      "item_code"
    ]
  },
  "deleteItem": {
    "title": "商品削除API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteItem",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteItem.html",
    "parameters": [
      "seller_id",
      "item_code"
    ],
    "required": [
      "item_code"
    ]
  },
  "submitItem": {
    "title": "商品個別反映API",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/submitItem",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/submitItem.html",
    "parameters": [
      "seller_id",
      "item_code"
    ],
    "required": [
      "item_code"
    ]
  },
  "myItemList": {
    "title": "商品リストAPI",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/myItemList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/myItemList.html",
    "parameters": [
      "seller_id",
      "stock",
      "start",
      "results",
      "query",
      "type",
      "sort",
      "stcat_key"
    ],
    "required": []
  },
  "uploadItemFile": {
    "title": "商品アップロードAPI",
    "group": "item",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadItemFile",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadItemFile.html",
    "parameters": [
      "seller_id",
      "type"
    ],
    "required": [
      "type"
    ],
    "uploadKind": "csv"
  },
  "getStock": {
    "title": "在庫参照API",
    "group": "stock",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getStock",
    "method": "POST",
    "encoding": "form",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getStock.html",
    "parameters": [
      "seller_id",
      "item_code"
    ],
    "required": [
      "item_code"
    ]
  },
  "setStock": {
    "title": "在庫更新API",
    "group": "stock",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/setStock",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "stock",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/setStock.html",
    "parameters": [
      "seller_id",
      "item_code",
      "quantity",
      "allow_overdraft",
      "stock_close"
    ],
    "required": [
      "item_code",
      "quantity"
    ]
  },
  "uploadStockFile": {
    "title": "在庫アップロードAPI",
    "group": "stock",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadStockFile",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadStockFile.html",
    "parameters": [
      "seller_id"
    ],
    "required": [],
    "uploadKind": "csv"
  },
  "itemImageList": {
    "title": "商品画像一覧API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/itemImageList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/itemImageList.html",
    "parameters": [
      "seller_id",
      "stcat_key",
      "query",
      "start",
      "results",
      "sort"
    ],
    "required": []
  },
  "uploadItemImage": {
    "title": "商品画像アップロードAPI",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadItemImage",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadItemImage.html",
    "parameters": [
      "seller_id"
    ],
    "required": [],
    "uploadKind": "image"
  },
  "uploadItemImagePack": {
    "title": "商品画像一括アップロードAPI",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadItemImagePack",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadItemImagePack.html",
    "parameters": [
      "seller_id"
    ],
    "required": [],
    "uploadKind": "zip"
  },
  "deleteItemImage": {
    "title": "商品画像削除API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteItemImage",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteItemImage.html",
    "parameters": [
      "seller_id",
      "image_id"
    ],
    "required": [
      "image_id"
    ]
  },
  "libImageList": {
    "title": "追加画像一覧API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/libImageList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/libImageList.html",
    "parameters": [
      "seller_id",
      "directory",
      "query",
      "start",
      "results",
      "sort"
    ],
    "required": []
  },
  "uploadLibImage": {
    "title": "追加画像アップロードAPI",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadLibImage",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadLibImage.html",
    "parameters": [
      "seller_id",
      "directory"
    ],
    "required": [],
    "uploadKind": "image",
    "notes": "追加画像はアップロード時に本番反映される場合がある。"
  },
  "uploadLibImagePack": {
    "title": "追加画像一括アップロードAPI",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/uploadLibImagePack",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/uploadLibImagePack.html",
    "parameters": [
      "seller_id",
      "directory"
    ],
    "required": [],
    "uploadKind": "zip",
    "notes": "追加画像はアップロード時に本番反映される場合がある。"
  },
  "deleteLibImage": {
    "title": "追加画像削除API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteLibImage",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteLibImage.html",
    "parameters": [
      "seller_id",
      "file_name"
    ],
    "required": [
      "file_name"
    ]
  },
  "libDirectoryList": {
    "title": "追加画像ディレクトリ一覧API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/libDirectoryList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/libDirectoryList.html",
    "parameters": [
      "seller_id"
    ],
    "required": []
  },
  "addLibDirectory": {
    "title": "追加画像ディレクトリ登録API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/addLibDirectory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/addLibDirectory.html",
    "parameters": [
      "seller_id",
      "directory"
    ],
    "required": [
      "directory"
    ]
  },
  "moveLibDirectory": {
    "title": "追加画像ディレクトリ変更API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/moveLibDirectory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/moveLibDirectory.html",
    "parameters": [
      "seller_id",
      "file_name",
      "directory"
    ],
    "required": [
      "file_name"
    ]
  },
  "deleteLibDirectory": {
    "title": "追加画像ディレクトリ削除API",
    "group": "image",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteLibDirectory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteLibDirectoy.html",
    "parameters": [
      "seller_id",
      "directory"
    ],
    "required": [
      "directory"
    ]
  },
  "getShopCategory": {
    "title": "SHPカテゴリツリー取得API",
    "group": "product",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getShopCategory",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getShopCategory.html",
    "parameters": [
      "seller_id",
      "category_code"
    ],
    "required": []
  },
  "getShopCategoryList": {
    "title": "SHPカテゴリ検索API",
    "group": "product",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getShopCategoryList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getShopCategoryList.html",
    "parameters": [
      "seller_id",
      "query",
      "category_code",
      "sort",
      "start",
      "results"
    ],
    "required": [
      "query"
    ]
  },
  "downloadShopCategories": {
    "title": "SHPカテゴリ/スペックダウンロードAPI",
    "group": "product",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/downloadShopCategories",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "file",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/downloadShopCategories.html",
    "parameters": [
      "seller_id",
      "since",
      "until",
      "spec"
    ],
    "required": []
  },
  "getShopBrandList": {
    "title": "SHPブランドコード検索API",
    "group": "product",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getShopBrandList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getShopBrandList.html",
    "parameters": [
      "seller_id",
      "query",
      "type",
      "sort",
      "start",
      "results"
    ],
    "required": [
      "query"
    ]
  },
  "downloadShopBrands": {
    "title": "SHPブランドコードダウンロードAPI",
    "group": "product",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/downloadShopBrands",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "file",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/downloadShopBrands.html",
    "parameters": [
      "seller_id",
      "since",
      "until"
    ],
    "required": []
  },
  "editStCategory": {
    "title": "ストアカテゴリ編集API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/editStCategory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/editStCategory.html",
    "parameters": [
      "seller_id",
      "page_key",
      "parent_page_key",
      "name",
      "template_id",
      "meta_desc",
      "display",
      "freespace1",
      "freespace2",
      "side_navi_image",
      "title_image",
      "category_image",
      "relevant_links",
      "hidden_flag",
      "paypaymall_freespace",
      "paypaymall_sp_freespace"
    ],
    "required": [
      "name"
    ]
  },
  "getStCategory": {
    "title": "ストアカテゴリ参照API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getStCategory",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getStCategory.html",
    "parameters": [
      "seller_id",
      "page_key"
    ],
    "required": [
      "page_key"
    ]
  },
  "stCategoryList": {
    "title": "ストアカテゴリ一覧API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/stCategoryList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/stCategoryList.html",
    "parameters": [
      "seller_id",
      "page_key"
    ],
    "required": []
  },
  "moveStCategory": {
    "title": "ストアカテゴリ移動API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/moveStCategory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/moveStCategory.html",
    "parameters": [
      "seller_id",
      "page_key",
      "dest_page_key"
    ],
    "required": [
      "page_key",
      "dest_page_key"
    ]
  },
  "deleteStCategory": {
    "title": "ストアカテゴリ削除API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteStCategory",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteStCategory.html",
    "parameters": [
      "seller_id",
      "page_key"
    ],
    "required": [
      "page_key"
    ],
    "notes": "カテゴリ配下の商品・子カテゴリも削除対象になる。"
  },
  "sortCategories": {
    "title": "ストアカテゴリ表示順序変更API",
    "group": "stCategory",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/sortCategories",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/sortCategories.html",
    "parameters": [
      "seller_id",
      "stcat_key",
      "sort_order"
    ],
    "required": [
      "stcat_key",
      "sort_order"
    ]
  },
  "dataCheckHistorySummary": {
    "title": "データチェック履歴一覧API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/dataCheckHistorySummary",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/dataCheckHistorySummary.html",
    "parameters": [
      "seller_id",
      "check_id",
      "file_type",
      "check_user",
      "start",
      "results"
    ],
    "required": []
  },
  "dataCheckHistorySummaryV2": {
    "title": "データチェック履歴一覧API（v2）",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V2/dataCheckHistorySummary",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/v2/dataCheckHistorySummary.html",
    "parameters": [
      "seller_id",
      "isFtpOnly",
      "dataType",
      "limit",
      "offset"
    ],
    "required": [
      "dataType"
    ]
  },
  "dataCheckHistoryDetail": {
    "title": "データチェック履歴詳細API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/dataCheckHistoryDetail",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/dataCheckHistoryDetail.html",
    "parameters": [
      "seller_id",
      "check_id",
      "error_type",
      "start",
      "results"
    ],
    "required": [
      "check_id"
    ]
  },
  "dataCheckHistoryDetailV2": {
    "title": "データチェック履歴詳細API（v2）",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V2/dataCheckHistoryDetail",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/v2/dataCheckHistoryDetail.html",
    "parameters": [
      "seller_id",
      "bulkId",
      "dataType",
      "limit",
      "offset"
    ],
    "required": [
      "bulkId",
      "dataType"
    ]
  },
  "publishHistorySummary": {
    "title": "反映履歴/未反映項目一覧API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/publishHistorySummary",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/publishHistorySummary.html",
    "parameters": [
      "seller_id",
      "publish_id",
      "start",
      "results",
      "sort"
    ],
    "required": []
  },
  "publishHistoryDetail": {
    "title": "反映履歴/未反映項目詳細API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/publishHistoryDetail",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/publishHistoryDetail.html",
    "parameters": [
      "seller_id",
      "publish_id",
      "start",
      "results",
      "sort"
    ],
    "required": [
      "publish_id"
    ]
  },
  "publishHistoryDetailV2": {
    "title": "反映履歴詳細API（v2）",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V2/publishHistoryDetail",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/v2/publishHistoryDetail.html",
    "parameters": [
      "seller_id",
      "bulk_id",
      "data_type",
      "start",
      "results"
    ],
    "required": [
      "bulk_id"
    ]
  },
  "reservePublish": {
    "title": "全反映予約API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/reservePublish",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/reservePublish.html",
    "parameters": [
      "seller_id",
      "mode",
      "reserve_time"
    ],
    "required": [
      "mode"
    ],
    "readMode": {
      "field": "mode",
      "value": 3
    },
    "notes": "mode=1はストア全体の未反映変更が対象。mode=2は予約取消、mode=3は参照。"
  },
  "downloadRequest": {
    "title": "ダウンロード要求API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/downloadRequest",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/downloadRequest.html",
    "parameters": [
      "seller_id",
      "type",
      "page_key"
    ],
    "required": [
      "type"
    ]
  },
  "downloadList": {
    "title": "ダウンロード準備完了通知API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/downloadList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/downloadList.html",
    "parameters": [
      "seller_id",
      "type"
    ],
    "required": []
  },
  "downloadSubmit": {
    "title": "ダウンロード実行API",
    "group": "selling",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/downloadSubmit",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "file",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/downloadSubmit.html",
    "parameters": [
      "seller_id",
      "type"
    ],
    "required": [
      "type"
    ]
  },
  "getPreviewHtml": {
    "title": "プレビューHTML参照API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getPreviewHtml",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getPreviewHtml.html",
    "parameters": [
      "seller_id",
      "page_key",
      "device_flg"
    ],
    "required": []
  },
  "getCustomPageDesign": {
    "title": "カスタムページ参照API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getCustomPageDesign",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getCustomPageDesign.html",
    "parameters": [
      "seller_id",
      "page_key"
    ],
    "required": [
      "page_key"
    ]
  },
  "editCustomPageDesign": {
    "title": "カスタムページ編集API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/editCustomPageDesign",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/editCustomPageDesign.html",
    "parameters": [
      "seller_id",
      "page_key",
      "name",
      "template_id",
      "freetext1",
      "freetext2",
      "freetext3",
      "spfreetext1"
    ],
    "required": [
      "name"
    ]
  },
  "getCustomPageList": {
    "title": "カスタムページ一覧API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getCustomPageList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getCustomPageList.html",
    "parameters": [
      "seller_id"
    ],
    "required": []
  },
  "deleteCustomPage": {
    "title": "カスタムページ削除API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteCustomPage",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteCustomPage.html",
    "parameters": [
      "seller_id",
      "page_key"
    ],
    "required": [
      "page_key"
    ]
  },
  "getStoreinfoFreespace": {
    "title": "ストア設定フリースペース参照API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getStoreinfoFreespace",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getStoreinfoFreespace.html",
    "parameters": [
      "seller_id"
    ],
    "required": []
  },
  "setStoreinfoFreespace": {
    "title": "ストア設定フリースペース編集API",
    "group": "design",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/setStoreinfoFreespace",
    "method": "POST",
    "encoding": "form",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "seller_id",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/setStoreinfoFreespace.html",
    "parameters": [
      "seller_id",
      "info_free_space1",
      "info_free_space2",
      "privacypolicy_free_space1",
      "guide_free_space1",
      "guide_free_space2",
      "guide_free_space3",
      "guide_free_space4"
    ],
    "required": []
  },
  "externalTalkAdd": {
    "title": "メッセージ投稿API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkAdd",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/send.html",
    "parameters": [
      "topicId",
      "body",
      "sellerId",
      "orderId",
      "fileList"
    ],
    "required": [
      "topicId",
      "body"
    ],
    "queryFields": [
      "topicId"
    ],
    "jsonSuccess": "topicid"
  },
  "externalTalkDetail": {
    "title": "質問詳細API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkDetail",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/detail.html",
    "parameters": [
      "sellerId",
      "topicId"
    ],
    "required": [
      "topicId"
    ],
    "queryFields": []
  },
  "externalTalkList": {
    "title": "質問一覧API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkList",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/list.html",
    "parameters": [
      "sellerId",
      "start",
      "result",
      "dateType",
      "startDate",
      "endDate",
      "qaType",
      "isPrivate",
      "category",
      "sort",
      "sortOrder",
      "requestFilter",
      "firstPoster",
      "serviceType"
    ],
    "required": [],
    "queryFields": []
  },
  "externalTalkRead": {
    "title": "質問既読API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkRead",
    "method": "PUT",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/read.html",
    "parameters": [
      "topicId",
      "sellerId"
    ],
    "required": [
      "topicId"
    ],
    "queryFields": [
      "topicId"
    ],
    "jsonSuccess": "status"
  },
  "externalTalkComplete": {
    "title": "質問完了API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkComplete",
    "method": "PUT",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/complete.html",
    "parameters": [
      "topicId",
      "sellerId",
      "completeConditionId"
    ],
    "required": [
      "topicId"
    ],
    "queryFields": [
      "topicId"
    ],
    "jsonSuccess": "status"
  },
  "externalTalkPrivate": {
    "title": "質問非公開API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkPrivate",
    "method": "PUT",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/access.html",
    "parameters": [
      "topicId",
      "sellerId"
    ],
    "required": [
      "topicId"
    ],
    "queryFields": [
      "topicId"
    ],
    "jsonSuccess": "status"
  },
  "externalTalkFileAdd": {
    "title": "ファイル投稿API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkFileAdd",
    "method": "POST",
    "encoding": "multipart",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/fileAdd.html",
    "parameters": [
      "topicId",
      "sellerId"
    ],
    "required": [
      "topicId"
    ],
    "uploadKind": "attachment",
    "queryFields": [
      "topicId"
    ],
    "jsonSuccess": "objectKey"
  },
  "externalTalkFileDownload": {
    "title": "ファイル取得API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkFileDownload",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "file",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/fileDownload.html",
    "parameters": [
      "key",
      "sellerId"
    ],
    "required": [
      "key"
    ],
    "queryFields": []
  },
  "externalTalkFileDelete": {
    "title": "ファイル削除API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalTalkFileDelete",
    "method": "DELETE",
    "encoding": "query",
    "readOnly": false,
    "success": "status",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/fileDelete.html",
    "parameters": [
      "key",
      "sellerId"
    ],
    "required": [
      "key"
    ],
    "queryFields": [],
    "jsonSuccess": "status"
  },
  "externalStoreTopicV2": {
    "title": "ショッピング用セラー新規問い合わせ投稿API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V2/externalStoreTopic",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/externalStoreTopic.html",
    "parameters": [
      "sellerId",
      "categoryId",
      "orderId",
      "title",
      "body"
    ],
    "required": [
      "categoryId",
      "orderId",
      "title",
      "body"
    ],
    "queryFields": [],
    "jsonSuccess": "topicid"
  },
  "externalAucStoreTopic": {
    "title": "Yahoo!オークション用セラー新規問い合わせ投稿API",
    "group": "question",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/externalAucStoreTopic",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/question/externalAucStoretopic.html",
    "parameters": [
      "sellerId",
      "categoryId",
      "orderId",
      "aucId",
      "preOrderId",
      "title",
      "body"
    ],
    "required": [
      "categoryId",
      "title",
      "body"
    ],
    "queryFields": [],
    "jsonSuccess": "topicid",
    "notes": "注文後はorderIdのみ。注文前はaucIdとpreOrderIdの両方を指定。顧客への投稿を行う。"
  },
  "getRealStock": {
    "title": "店頭在庫情報取得API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getRealStock",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getRealStock.html",
    "parameters": [
      "sellerId",
      "srId",
      "skuId"
    ],
    "required": []
  },
  "setRealStock": {
    "title": "店舗在庫情報登録更新API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/setRealStock",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/setRealStock.html",
    "parameters": [
      "sellerId",
      "stocks",
      "stocks/srId",
      "stocks/skuId",
      "stocks/storeInStock",
      "stocks/storeInStockFew",
      "stocks/storeInStockUpdatedTime"
    ],
    "required": [
      "stocks"
    ],
    "jsonSuccess": "status"
  },
  "deleteRealStock": {
    "title": "店舗在庫情報削除API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/deleteRealStock",
    "method": "DELETE",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/deleteRealStock.html",
    "parameters": [
      "sellerId",
      "stocks",
      "stocks/srId",
      "stocks/skuId"
    ],
    "required": [
      "stocks"
    ],
    "jsonSuccess": "status"
  },
  "getRealStockList": {
    "title": "複数店頭在庫情報取得API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getRealStockList",
    "method": "POST",
    "encoding": "json",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getRealStockList.html",
    "parameters": [
      "sellerId",
      "items",
      "items/srId",
      "items/skuId"
    ],
    "required": [
      "items"
    ],
    "notes": "本文とcurl例が不一致。2026-11-04の実接続でPOST + JSON items配列の成功を確認。stocks/storesはHTTP 400。"
  },
  "getRealStore": {
    "title": "店舗情報取得API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/getRealStore",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/getRealStore.html",
    "parameters": [
      "sellerId",
      "shopCode"
    ],
    "required": []
  },
  "setRealStore": {
    "title": "店舗情報登録更新API",
    "group": "real",
    "url": "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/setRealStore",
    "method": "POST",
    "encoding": "json",
    "readOnly": false,
    "success": "data",
    "response": "data",
    "sellerField": "sellerId",
    "sellerLocation": "body",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/setRealStore.html",
    "parameters": [
      "sellerId",
      "stores",
      "stores/shopCode",
      "stores/branchName",
      "stores/zipCode",
      "stores/prefecture",
      "stores/city",
      "stores/area",
      "stores/address1",
      "stores/address2",
      "stores/phoneNumber",
      "stores/openTime",
      "stores/closeTime",
      "stores/regularHoliday",
      "stores/holiday",
      "stores/storeCode",
      "stores/receiptDay",
      "stores/receiptHour",
      "stores/receiptDayStockLittle",
      "stores/receiptHourStockLittle",
      "stores/listUses"
    ],
    "required": [
      "stores"
    ],
    "jsonSuccess": "status",
    "notes": "店舗情報を上書きし、元の情報が削除される。"
  },
  "itemSearch": {
    "title": "（新仕様）商品検索",
    "group": "public",
    "url": "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "appid",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/v3/itemsearch.html",
    "parameters": [
      "appid",
      "affiliate_type",
      "affiliate_id",
      "query",
      "jan_code",
      "image_size",
      "genre_category_id",
      "brand_id",
      "seller_id",
      "price_from",
      "price_to",
      "affiliate_rate_from",
      "affiliate_rate_to",
      "preorder",
      "results",
      "start",
      "in_stock",
      "is_discounted",
      "shipping",
      "payment",
      "user_rank",
      "sale_end_from",
      "sale_end_to",
      "sale_start_from",
      "sale_start_to",
      "delivery_area",
      "delivery_day",
      "delivery_deadline",
      "sort",
      "condition",
      "is_cross_border_agency"
    ],
    "required": []
  },
  "highRatingTrendRanking": {
    "title": "高評価トレンドランキング",
    "group": "public",
    "url": "https://shopping.yahooapis.jp/ShoppingWebService/V1/highRatingTrendRanking",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "appid",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/highRatingTrendRanking.html",
    "parameters": [
      "appid",
      "affiliate_type",
      "affiliate_id",
      "query",
      "genre_category_id",
      "brand_id",
      "exclude_genre_category_id",
      "exclude_brand_id",
      "price_from",
      "price_to",
      "seller_id",
      "delivery",
      "app_ban",
      "offset",
      "limit"
    ],
    "required": []
  },
  "categorySearch": {
    "title": "カテゴリID取得",
    "group": "public",
    "url": "https://shopping.yahooapis.jp/ShoppingWebService/V1/categorySearch",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "appid",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/categorysearch.html",
    "parameters": [
      "appid",
      "output",
      "affiliate_type",
      "affiliate_id",
      "callback",
      "category_id"
    ],
    "required": [
      "category_id"
    ]
  },
  "itemLookup": {
    "title": "商品コード検索(商品詳細)",
    "group": "public",
    "url": "https://shopping.yahooapis.jp/ShoppingWebService/V1/itemLookup",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "appid",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/itemlookup.html",
    "parameters": [
      "appid",
      "affiliate_type",
      "affiliate_id",
      "callback",
      "itemcode",
      "responsegroup",
      "image_size",
      "license"
    ],
    "required": [
      "itemcode"
    ]
  },
  "queryRanking": {
    "title": "キーワードランキング（v2）",
    "group": "public",
    "url": "https://shopping.yahooapis.jp/ShoppingWebService/V2/queryRanking",
    "method": "GET",
    "encoding": "query",
    "readOnly": true,
    "success": "data",
    "response": "data",
    "sellerField": "appid",
    "sellerLocation": "query",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/v2/queryranking.html",
    "parameters": [
      "appid",
      "affiliate_type",
      "affiliate_id",
      "type",
      "hits",
      "offset",
      "category_id"
    ],
    "required": []
  }
} as const;

export const retiredApis = [
  {
    "title": "（旧仕様）商品検索",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/itemsearch.html"
  },
  {
    "title": "おすすめ情報モジュール",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/getmodule.html"
  },
  {
    "title": "商品レビュー検索",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/reviewsearch.html"
  },
  {
    "title": "カテゴリランキング",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/categoryranking.html"
  },
  {
    "title": "ポイントキャンペーン情報取得",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/shopCampaignSearch.html"
  },
  {
    "title": "販促イベント検索",
    "source": "https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/eventsearch.html"
  }
] as const;
