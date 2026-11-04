# Yahoo!ショッピング API対応表

確認日: 2026-11-04。公式トップの11運営カテゴリと公開情報APIを照合。全現行エンドポイントを`yshop_read_api` / `yshop_write_api`から指定可能。既存15ツールは維持。

| 分野 | 操作ID | API | 通信 | 種別 |
| --- | --- | --- | --- | --- |
| 注文 | `orderCount` | [注文ステータス別件数参照API](https://developer.yahoo.co.jp/webapi/shopping/orderCount.html) | GET / query | 参照 |
| 注文 | `orderList` | [注文検索API](https://developer.yahoo.co.jp/webapi/shopping/orderList.html) | POST / xml | 参照 |
| 注文 | `orderInfo` | [注文詳細API](https://developer.yahoo.co.jp/webapi/shopping/orderInfo.html) | POST / xml | 参照 |
| 注文 | `orderStatusChange` | [注文ステータス変更API](https://developer.yahoo.co.jp/webapi/shopping/orderStatusChange.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderPayStatusChange` | [入金ステータス変更API](https://developer.yahoo.co.jp/webapi/shopping/orderPayStatusChange.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderShipStatusChange` | [出荷ステータス変更API](https://developer.yahoo.co.jp/webapi/shopping/orderShipStatusChange.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderChange` | [注文内容変更API](https://developer.yahoo.co.jp/webapi/shopping/orderChange.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderChangeHistory` | [注文操作履歴一覧API](https://developer.yahoo.co.jp/webapi/shopping/orderChangeHistory.html) | GET / query | 参照 |
| 注文 | `orderSplit` | [注文分割API](https://developer.yahoo.co.jp/webapi/shopping/orderSplit.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderItemAdd` | [注文ライン追加API](https://developer.yahoo.co.jp/webapi/shopping/orderItemAdd.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderPayNumber` | [支払番号発行API](https://developer.yahoo.co.jp/webapi/shopping/orderPayNumber.html) | POST / xml | 更新（既定はdry_run） |
| 注文 | `orderCouponCancel` | [クーポンキャンセルAPI](https://developer.yahoo.co.jp/webapi/shopping/orderCouponCancel.html) | POST / xml | 更新（既定はdry_run） |
| 定期購入 | `subscriptionOriginCount` | [定期購入価格別件数取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/origincount.html) | GET / query | 参照 |
| 定期購入 | `subscriptionOriginList` | [定期購入親注文一覧取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/list.html) | POST / json | 参照 |
| 定期購入 | `subscriptionReplicaList` | [定期購入子注文一覧取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/replica.html) | GET / query | 参照 |
| 定期購入 | `subscriptionOriginDetail` | [定期購入親注文詳細取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/detail.html) | GET / query | 参照 |
| 定期購入 | `subscriptionSkip` | [定期購入次回注文スキップAPI](https://developer.yahoo.co.jp/webapi/shopping/subscription/skip.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionCancelMulti` | [定期購入親注文一括解約API](https://developer.yahoo.co.jp/webapi/shopping/subscription/cancelmulti.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionCancel` | [定期購入親注文解約API](https://developer.yahoo.co.jp/webapi/shopping/subscription/cancel.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionShipDate` | [定期購入お届け予定日変更API](https://developer.yahoo.co.jp/webapi/shopping/subscription/shipdate.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionChange` | [定期購入情報変更API](https://developer.yahoo.co.jp/webapi/shopping/subscription/change.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionHistoryList` | [定期購入情報変更履歴一覧API](https://developer.yahoo.co.jp/webapi/shopping/subscription/historylist.html) | GET / query | 参照 |
| 定期購入 | `subscriptionHistory` | [定期購入情報変更履歴詳細API](https://developer.yahoo.co.jp/webapi/shopping/subscription/history.html) | GET / query | 参照 |
| 定期購入 | `subscriptionChangeRequest` | [定期購入変更要求登録API](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequest.html) | POST / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionChangeRequestCancel` | [定期購入変更要求キャンセルAPI](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestcancel.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionChangeRequestBulk` | [定期購入変更要求一括登録API](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestbulk.html) | PATCH / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionChangeRequestCancelBulk` | [定期購入変更要求一括キャンセルAPI](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestcancelbulk.html) | POST / json | 更新（既定はdry_run） |
| 定期購入 | `subscriptionChangeRequestList` | [定期購入変更要求一覧取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestlist.html) | POST / json | 参照 |
| 定期購入 | `subscriptionChangeRequestDetail` | [定期購入変更要求詳細一覧取得API](https://developer.yahoo.co.jp/webapi/shopping/subscription/changerequestlistinfo.html) | GET / query | 参照 |
| 商品 | `editItem` | [商品登録API](https://developer.yahoo.co.jp/webapi/shopping/editItem.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `updateItems` | [商品一括更新API](https://developer.yahoo.co.jp/webapi/shopping/updateItems.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `moveItems` | [商品移動API](https://developer.yahoo.co.jp/webapi/shopping/moveItems.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `setItemDisplayPriority` | [商品表示優先順変更API](https://developer.yahoo.co.jp/webapi/shopping/setItemDisplayPriority.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `getItem` | [商品参照API](https://developer.yahoo.co.jp/webapi/shopping/getItem.html) | GET / query | 参照 |
| 商品 | `deleteItem` | [商品削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteItem.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `submitItem` | [商品個別反映API](https://developer.yahoo.co.jp/webapi/shopping/submitItem.html) | POST / form | 更新（既定はdry_run） |
| 商品 | `myItemList` | [商品リストAPI](https://developer.yahoo.co.jp/webapi/shopping/myItemList.html) | GET / query | 参照 |
| 商品 | `uploadItemFile` | [商品アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadItemFile.html) | POST / multipart | 更新（既定はdry_run） |
| 在庫 | `getStock` | [在庫参照API](https://developer.yahoo.co.jp/webapi/shopping/getStock.html) | POST / form | 参照 |
| 在庫 | `setStock` | [在庫更新API](https://developer.yahoo.co.jp/webapi/shopping/setStock.html) | POST / form | 更新（既定はdry_run） |
| 在庫 | `uploadStockFile` | [在庫アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadStockFile.html) | POST / multipart | 更新（既定はdry_run） |
| 画像 | `itemImageList` | [商品画像一覧API](https://developer.yahoo.co.jp/webapi/shopping/itemImageList.html) | GET / query | 参照 |
| 画像 | `uploadItemImage` | [商品画像アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadItemImage.html) | POST / multipart | 更新（既定はdry_run） |
| 画像 | `uploadItemImagePack` | [商品画像一括アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadItemImagePack.html) | POST / multipart | 更新（既定はdry_run） |
| 画像 | `deleteItemImage` | [商品画像削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteItemImage.html) | POST / form | 更新（既定はdry_run） |
| 画像 | `libImageList` | [追加画像一覧API](https://developer.yahoo.co.jp/webapi/shopping/libImageList.html) | GET / query | 参照 |
| 画像 | `uploadLibImage` | [追加画像アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadLibImage.html) | POST / multipart | 更新（既定はdry_run） |
| 画像 | `uploadLibImagePack` | [追加画像一括アップロードAPI](https://developer.yahoo.co.jp/webapi/shopping/uploadLibImagePack.html) | POST / multipart | 更新（既定はdry_run） |
| 画像 | `deleteLibImage` | [追加画像削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteLibImage.html) | POST / form | 更新（既定はdry_run） |
| 画像 | `libDirectoryList` | [追加画像ディレクトリ一覧API](https://developer.yahoo.co.jp/webapi/shopping/libDirectoryList.html) | GET / query | 参照 |
| 画像 | `addLibDirectory` | [追加画像ディレクトリ登録API](https://developer.yahoo.co.jp/webapi/shopping/addLibDirectory.html) | POST / form | 更新（既定はdry_run） |
| 画像 | `moveLibDirectory` | [追加画像ディレクトリ変更API](https://developer.yahoo.co.jp/webapi/shopping/moveLibDirectory.html) | POST / form | 更新（既定はdry_run） |
| 画像 | `deleteLibDirectory` | [追加画像ディレクトリ削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteLibDirectoy.html) | POST / form | 更新（既定はdry_run） |
| SHPカテゴリ・ブランド | `getShopCategory` | [SHPカテゴリツリー取得API](https://developer.yahoo.co.jp/webapi/shopping/getShopCategory.html) | GET / query | 参照 |
| SHPカテゴリ・ブランド | `getShopCategoryList` | [SHPカテゴリ検索API](https://developer.yahoo.co.jp/webapi/shopping/getShopCategoryList.html) | GET / query | 参照 |
| SHPカテゴリ・ブランド | `downloadShopCategories` | [SHPカテゴリ/スペックダウンロードAPI](https://developer.yahoo.co.jp/webapi/shopping/downloadShopCategories.html) | GET / query | 参照 |
| SHPカテゴリ・ブランド | `getShopBrandList` | [SHPブランドコード検索API](https://developer.yahoo.co.jp/webapi/shopping/getShopBrandList.html) | GET / query | 参照 |
| SHPカテゴリ・ブランド | `downloadShopBrands` | [SHPブランドコードダウンロードAPI](https://developer.yahoo.co.jp/webapi/shopping/downloadShopBrands.html) | GET / query | 参照 |
| ストアカテゴリ | `editStCategory` | [ストアカテゴリ編集API](https://developer.yahoo.co.jp/webapi/shopping/editStCategory.html) | POST / form | 更新（既定はdry_run） |
| ストアカテゴリ | `getStCategory` | [ストアカテゴリ参照API](https://developer.yahoo.co.jp/webapi/shopping/getStCategory.html) | GET / query | 参照 |
| ストアカテゴリ | `stCategoryList` | [ストアカテゴリ一覧API](https://developer.yahoo.co.jp/webapi/shopping/stCategoryList.html) | GET / query | 参照 |
| ストアカテゴリ | `moveStCategory` | [ストアカテゴリ移動API](https://developer.yahoo.co.jp/webapi/shopping/moveStCategory.html) | POST / form | 更新（既定はdry_run） |
| ストアカテゴリ | `deleteStCategory` | [ストアカテゴリ削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteStCategory.html) | POST / form | 更新（既定はdry_run） |
| ストアカテゴリ | `sortCategories` | [ストアカテゴリ表示順序変更API](https://developer.yahoo.co.jp/webapi/shopping/sortCategories.html) | POST / form | 更新（既定はdry_run） |
| 出品管理 | `dataCheckHistorySummary` | [データチェック履歴一覧API](https://developer.yahoo.co.jp/webapi/shopping/dataCheckHistorySummary.html) | GET / query | 参照 |
| 出品管理 | `dataCheckHistorySummaryV2` | [データチェック履歴一覧API（v2）](https://developer.yahoo.co.jp/webapi/shopping/v2/dataCheckHistorySummary.html) | GET / query | 参照 |
| 出品管理 | `dataCheckHistoryDetail` | [データチェック履歴詳細API](https://developer.yahoo.co.jp/webapi/shopping/dataCheckHistoryDetail.html) | GET / query | 参照 |
| 出品管理 | `dataCheckHistoryDetailV2` | [データチェック履歴詳細API（v2）](https://developer.yahoo.co.jp/webapi/shopping/v2/dataCheckHistoryDetail.html) | GET / query | 参照 |
| 出品管理 | `publishHistorySummary` | [反映履歴/未反映項目一覧API](https://developer.yahoo.co.jp/webapi/shopping/publishHistorySummary.html) | GET / query | 参照 |
| 出品管理 | `publishHistoryDetail` | [反映履歴/未反映項目詳細API](https://developer.yahoo.co.jp/webapi/shopping/publishHistoryDetail.html) | GET / query | 参照 |
| 出品管理 | `publishHistoryDetailV2` | [反映履歴詳細API（v2）](https://developer.yahoo.co.jp/webapi/shopping/v2/publishHistoryDetail.html) | GET / query | 参照 |
| 出品管理 | `reservePublish` | [全反映予約API](https://developer.yahoo.co.jp/webapi/shopping/reservePublish.html) | POST / form | 更新（既定はdry_run） |
| 出品管理 | `downloadRequest` | [ダウンロード要求API](https://developer.yahoo.co.jp/webapi/shopping/downloadRequest.html) | POST / form | 更新（既定はdry_run） |
| 出品管理 | `downloadList` | [ダウンロード準備完了通知API](https://developer.yahoo.co.jp/webapi/shopping/downloadList.html) | GET / query | 参照 |
| 出品管理 | `downloadSubmit` | [ダウンロード実行API](https://developer.yahoo.co.jp/webapi/shopping/downloadSubmit.html) | GET / query | 参照 |
| デザイン | `getPreviewHtml` | [プレビューHTML参照API](https://developer.yahoo.co.jp/webapi/shopping/getPreviewHtml.html) | GET / query | 参照 |
| デザイン | `getCustomPageDesign` | [カスタムページ参照API](https://developer.yahoo.co.jp/webapi/shopping/getCustomPageDesign.html) | GET / query | 参照 |
| デザイン | `editCustomPageDesign` | [カスタムページ編集API](https://developer.yahoo.co.jp/webapi/shopping/editCustomPageDesign.html) | POST / form | 更新（既定はdry_run） |
| デザイン | `getCustomPageList` | [カスタムページ一覧API](https://developer.yahoo.co.jp/webapi/shopping/getCustomPageList.html) | GET / query | 参照 |
| デザイン | `deleteCustomPage` | [カスタムページ削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteCustomPage.html) | POST / form | 更新（既定はdry_run） |
| デザイン | `getStoreinfoFreespace` | [ストア設定フリースペース参照API](https://developer.yahoo.co.jp/webapi/shopping/getStoreinfoFreespace.html) | GET / query | 参照 |
| デザイン | `setStoreinfoFreespace` | [ストア設定フリースペース編集API](https://developer.yahoo.co.jp/webapi/shopping/setStoreinfoFreespace.html) | POST / form | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkAdd` | [メッセージ投稿API](https://developer.yahoo.co.jp/webapi/shopping/question/send.html) | POST / json | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkDetail` | [質問詳細API](https://developer.yahoo.co.jp/webapi/shopping/question/detail.html) | GET / query | 参照 |
| 問い合わせ | `externalTalkList` | [質問一覧API](https://developer.yahoo.co.jp/webapi/shopping/question/list.html) | GET / query | 参照 |
| 問い合わせ | `externalTalkRead` | [質問既読API](https://developer.yahoo.co.jp/webapi/shopping/question/read.html) | PUT / json | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkComplete` | [質問完了API](https://developer.yahoo.co.jp/webapi/shopping/question/complete.html) | PUT / json | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkPrivate` | [質問非公開API](https://developer.yahoo.co.jp/webapi/shopping/question/access.html) | PUT / json | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkFileAdd` | [ファイル投稿API](https://developer.yahoo.co.jp/webapi/shopping/question/fileAdd.html) | POST / multipart | 更新（既定はdry_run） |
| 問い合わせ | `externalTalkFileDownload` | [ファイル取得API](https://developer.yahoo.co.jp/webapi/shopping/question/fileDownload.html) | GET / query | 参照 |
| 問い合わせ | `externalTalkFileDelete` | [ファイル削除API](https://developer.yahoo.co.jp/webapi/shopping/question/fileDelete.html) | DELETE / query | 更新（既定はdry_run） |
| 問い合わせ | `externalStoreTopicV2` | [ショッピング用セラー新規問い合わせ投稿API](https://developer.yahoo.co.jp/webapi/shopping/question/externalStoreTopic.html) | POST / json | 更新（既定はdry_run） |
| 問い合わせ | `externalAucStoreTopic` | [Yahoo!オークション用セラー新規問い合わせ投稿API](https://developer.yahoo.co.jp/webapi/shopping/question/externalAucStoretopic.html) | POST / json | 更新（既定はdry_run） |
| 店舗在庫 | `getRealStock` | [店頭在庫情報取得API](https://developer.yahoo.co.jp/webapi/shopping/getRealStock.html) | GET / query | 参照 |
| 店舗在庫 | `setRealStock` | [店舗在庫情報登録更新API](https://developer.yahoo.co.jp/webapi/shopping/setRealStock.html) | POST / json | 更新（既定はdry_run） |
| 店舗在庫 | `deleteRealStock` | [店舗在庫情報削除API](https://developer.yahoo.co.jp/webapi/shopping/deleteRealStock.html) | DELETE / json | 更新（既定はdry_run） |
| 店舗在庫 | `getRealStockList` | [複数店頭在庫情報取得API](https://developer.yahoo.co.jp/webapi/shopping/getRealStockList.html) | POST / json | 参照 |
| 店舗在庫 | `getRealStore` | [店舗情報取得API](https://developer.yahoo.co.jp/webapi/shopping/getRealStore.html) | GET / query | 参照 |
| 店舗在庫 | `setRealStore` | [店舗情報登録更新API](https://developer.yahoo.co.jp/webapi/shopping/setRealStore.html) | POST / json | 更新（既定はdry_run） |
| 公開情報 | `itemSearch` | [（新仕様）商品検索](https://developer.yahoo.co.jp/webapi/shopping/v3/itemsearch.html) | GET / query | 参照 |
| 公開情報 | `highRatingTrendRanking` | [高評価トレンドランキング](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/highRatingTrendRanking.html) | GET / query | 参照 |
| 公開情報 | `categorySearch` | [カテゴリID取得](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/categorysearch.html) | GET / query | 参照 |
| 公開情報 | `itemLookup` | [商品コード検索(商品詳細)](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/itemlookup.html) | GET / query | 参照 |
| 公開情報 | `queryRanking` | [キーワードランキング（v2）](https://developer.yahoo.co.jp/webapi/shopping/v2/queryranking.html) | GET / query | 参照 |

## 提供終了

以下は現行エンドポイント数に含めません。
- [（旧仕様）商品検索](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/itemsearch.html)
- [おすすめ情報モジュール](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/getmodule.html)
- [商品レビュー検索](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/reviewsearch.html)
- [カテゴリランキング](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/categoryranking.html)
- [ポイントキャンペーン情報取得](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/shopCampaignSearch.html)
- [販促イベント検索](https://developer.yahoo.co.jp/webapi/shopping/shopping/v1/eventsearch.html)

## 仕様書の不整合


- `subscriptionOriginCount`: 表のselleridはサンプルURLのsellerIdとして送信。
- `subscriptionCancelMulti`: リクエストURL欄はorigin/cancel、サンプルはorigins/cancel。URL欄の単数originを使用。本番更新は未実行。
- `subscriptionChangeRequestList`: 本文はPOST、サンプルはPATCH。本文のPOSTを使用し、2026-11-04の実接続で検索成功を確認。
- `subscriptionChangeRequestDetail`: 本文はGET、サンプルはPATCH。本文のGETを使用。
- `editItem`: 省略した商品項目を初期値で上書きする全体保存。部分変更にはupdateItemsを使用。
- `uploadLibImage`: 追加画像はアップロード時に本番反映される場合がある。
- `uploadLibImagePack`: 追加画像はアップロード時に本番反映される場合がある。
- `deleteStCategory`: カテゴリ配下の商品・子カテゴリも削除対象になる。
- `reservePublish`: mode=1はストア全体の未反映変更が対象。mode=2は予約取消、mode=3は参照。
- `externalAucStoreTopic`: 注文後はorderIdのみ。注文前はaucIdとpreOrderIdの両方を指定。顧客への投稿を行う。
- `getRealStockList`: 本文とcurl例が不一致。2026-11-04の実接続でPOST + JSON items配列の成功を確認。stocks/storesはHTTP 400。
- `setRealStore`: 店舗情報を上書きし、元の情報が削除される。

## 検証範囲

全エンドポイントの登録・通信形式・ドライラン・パラメータ転送はローカルテストで確認します。本番の削除・注文変更・購入者への投稿・公開・アップロードは実行しません。利用申請や店舗の契約によって使用権限が異なります。

PHPserialize・JSONPは別APIではなく応答表現のため、標準のXML/JSONで提供します。追加パラメータは公式名でそのまま指定でき、値の制約・条件付き必須は公式API側でも検証されます。
