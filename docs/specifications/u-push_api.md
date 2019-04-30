# U-push API集成文档

## 概述

### 基本说明

API接口均基于HTTP REST协议，若无特殊说明接口均使用UTF-8编码，消息体参数以及返回结果均采用JSON格式。

**注意**：使用API前需要在[Web后台](http://push.umeng.com/)的App应用信息页面获取 **Appkey** 和 **App Master Secret**，同时在[Web后台](http://push.umeng.com/)添加**服务器IP地址**做IP白名单安全验证或**关闭IP白名单**。

### 名词解释

- **Appkey：**应用唯一标识。友盟消息推送服务提供的appkey和友盟统计分析平台使用的同一套appkey。
- **App Master Secret：**服务器秘钥，用于服务器端调用API请求时对发送内容做签名验证。
- **Device Token：**友盟消息推送服务对设备的唯一标识。Android的device_token是44位字符串，iOS的device_token是64位。
- **Alias：**开发者自有账号，开发者可以在SDK中调用setAlias(alias, alias_type)接口将alias+alias_type与device_token做绑定，之后开发者就可以根据自有业务逻辑筛选出alias进行消息推送。
- **单播(unicast)：**向指定的设备发送消息。
- **列播(listcast)：**向指定的一批设备发送消息。
- **广播(broadcast)：**向安装该App的所有设备发送消息。
- **组播(groupcast):：**向满足特定条件的设备集合发送消息，例如: “特定版本”、”特定地域”等。
- **文件播(filecast)：**开发者将批量的device_token或者alias存放到文件，通过文件ID进行消息发送。
- **自定义播(customizedcast)：**开发者通过自有的alias进行推送，可以针对单个或者一批alias进行推送，也可以将alias存放到文件进行发送。
- **通知-Android(notification)：**消息送达到用户设备后，由友盟SDK接管处理并在通知栏上显示通知内容。
- **消息-Android(message)：**消息送达到用户设备后，消息内容透传给应用自身进行解析处理。
- **通知-iOS：**和APNs定义一致。
- **静默推送-iOS：**和APNs定义一致。
- **测试模式：**在广播、组播等大规模发送消息的情况下，为了防止开发者误将测试消息大面积发给线上用户，特增加了测试模式。 测试模式下，只会将消息发送给测试设备。测试设备需要到[Web后台](http://push.umeng.com/)上手工添加。
- **测试模式-Android：**Android的测试设备是正式设备的一个子集
- **测试模式-iOS：** iOS的测试模式对应APNs的开发环境(sandbox), 正式模式对应APNs的生产环境(prod)，测试设备和正式设备完全隔离。
- **签名：** 为了保证调用API的请求是合法者发送且参数没有被篡改，需要在调用API时对发送的所有内容进行签名。签名附加在调用地址后面，签名的计算方式参见附录K。
- **推送类型：**单播(unicast)、列播(listcast)、自定义播(customizedcast且不带file_id)统称为单播类消息，[Web后台](http://push.umeng.com/)不会展示此类消息详细信息，仅展示前一天的汇总数据；广播(broadcast)、文件播(filecast)、组播(groupcast)、自定义播(customizedcast且file_id不为空)统称为任务类消息，任务类消息支持API查询、撤销操作，[Web后台](http://push.umeng.com/)会展示任务类消息详细信息。

### 发送限制

为了提供更加稳定高效的推送环境，生产环境下有以下发送限制（测试环境无任何限制）：

- 广播(broadcast)默认每天可推送10次
- 组播(groupcast)默认每分钟可推送5次
- 文件播(filecast)默认每小时可推送300次
- 自定义播(customizedcast, 且file_id不为空)默认每小时可推送300次
- 单播类消息暂无推送限制

## 接口描述

### 消息发送

#### 功能说明

开发者通过此接口，可向指定用户(单播)、所有用户(广播)或满足特定条件的用户群(组播)，发送通知或消息。此外，该接口还支持开发者使用自有的账号系统(alias) 来发送消息给指定的账号或者账号群。

#### 调用地址

POST (Content-Type: application/json)

http接口：http://msg.umeng.com/api/send?sign=mysign

https接口：https://msgapi.umeng.com/api/send?sign=mysign

签名(sign=mysign)的计算方式见《关于签名》

#### 调用参数

``` json
{
    "appkey":"xx",        // 必填，应用唯一标识
    "timestamp":"xx",    // 必填，时间戳，10位或者13位均可，时间戳有效期为10分钟
    "type":"xx",        // 必填，消息发送类型,其值可以为: 
                        //   unicast-单播
                        //   listcast-列播，要求不超过500个device_token
                        //   filecast-文件播，多个device_token可通过文件形式批量发送
                        //   broadcast-广播
                        //   groupcast-组播，按照filter筛选用户群, 请参照filter参数
                        //   customizedcast，通过alias进行推送，包括以下两种case:
                        //     - alias: 对单个或者多个alias进行推送
                        //     - file_id: 将alias存放到文件后，根据file_id来推送
    "device_tokens":"xx",    // 当type=unicast时, 必填, 表示指定的单个设备
                            // 当type=listcast时, 必填, 要求不超过500个, 以英文逗号分隔
    "alias_type": "xx",    // 当type=customizedcast时, 必填
                        // alias的类型, alias_type可由开发者自定义, 开发者在SDK中
                        // 调用setAlias(alias, alias_type)时所设置的alias_type
    "alias":"xx",        // 当type=customizedcast时, 选填(此参数和file_id二选一)
                        // 开发者填写自己的alias, 要求不超过500个alias, 多个alias以英文逗号间隔
                        // 在SDK中调用setAlias(alias, alias_type)时所设置的alias
    "file_id":"xx",    // 当type=filecast时，必填，file内容为多条device_token，以回车符分割
                    // 当type=customizedcast时，选填(此参数和alias二选一)
                    //   file内容为多条alias，以回车符分隔。注意同一个文件内的alias所对应
                    //   的alias_type必须和接口参数alias_type一致。
                    // 使用文件播需要先调用文件上传接口获取file_id，参照"文件上传"
    "filter":{},    // 当type=groupcast时，必填，用户筛选条件，如用户标签、渠道等，参考附录G。
    "payload": {    // 必填，JSON格式，具体消息内容(Android最大为1840B)
        "display_type":"xx",    // 必填，消息类型: notification(通知)、message(消息)
        "body": {    // 必填，消息体。
                // 当display_type=message时，body的内容只需填写custom字段。
                // 当display_type=notification时，body包含如下参数:
            // 通知展现内容:
            "ticker":"xx",    // 必填，通知栏提示文字
            "title":"xx",    // 必填，通知标题
            "text":"xx",    // 必填，通知文字描述 

            // 自定义通知图标:
            "icon":"xx",    // 可选，状态栏图标ID，R.drawable.[smallIcon]，
            // 如果没有，默认使用应用图标。
            // 图片要求为24*24dp的图标，或24*24px放在drawable-mdpi下。
            // 注意四周各留1个dp的空白像素
            "largeIcon":"xx",    // 可选，通知栏拉开后左侧图标ID，R.drawable.[largeIcon]，
            // 图片要求为64*64dp的图标，
            // 可设计一张64*64px放在drawable-mdpi下，
            // 注意图片四周留空，不至于显示太拥挤
            "img": "xx",    // 可选，通知栏大图标的URL链接。该字段的优先级大于largeIcon。
                            // 该字段要求以http或者https开头。

            // 自定义通知声音:
            "sound": "xx",    // 可选，通知声音，R.raw.[sound]。
                            // 如果该字段为空，采用SDK默认的声音，即res/raw/下的
                            // umeng_push_notification_default_sound声音文件。如果
                            // SDK默认声音文件不存在，则使用系统默认Notification提示音。

            // 自定义通知样式:
            "builder_id": xx,    // 可选，默认为0，用于标识该通知采用的样式。使用该参数时，
                                // 开发者必须在SDK里面实现自定义通知栏样式。

            // 通知到达设备后的提醒方式，注意，"true/false"为字符串
            "play_vibrate":"true/false",    // 可选，收到通知是否震动，默认为"true"
            "play_lights":"true/false",        // 可选，收到通知是否闪灯，默认为"true"
            "play_sound":"true/false",        // 可选，收到通知是否发出声音，默认为"true"

            // 点击"通知"的后续行为，默认为打开app。
            "after_open": "xx",    // 可选，默认为"go_app"，值可以为:
                                //   "go_app": 打开应用
                                //   "go_url": 跳转到URL
                                //   "go_activity": 打开特定的activity
                                //   "go_custom": 用户自定义内容。
            "url": "xx",    // 当after_open=go_url时，必填。
                            // 通知栏点击后跳转的URL，要求以http或者https开头
            "activity":"xx",    // 当after_open=go_activity时，必填。
                                // 通知栏点击后打开的Activity
            "custom":"xx"/{}    // 当display_type=message时, 必填
                                // 当display_type=notification且
                                // after_open=go_custom时，必填
                                // 用户自定义内容，可以为字符串或者JSON格式。
        },
        extra:{    // 可选，JSON格式，用户自定义key-value。只对"通知"
                // (display_type=notification)生效。
                // 可以配合通知到达后，打开App/URL/Activity使用。
            "key1": "value1",
            "key2": "value2",
            ...
        }
    },
    "policy":{    // 可选，发送策略
        "start_time":"xx",    // 可选，定时发送时，若不填写表示立即发送。
                            // 定时发送时间不能小于当前时间
                            // 格式: "yyyy-MM-dd HH:mm:ss"。 
                            // 注意，start_time只对任务类消息生效。
        "expire_time":"xx",    // 可选，消息过期时间，其值不可小于发送时间或者
                            // start_time(如果填写了的话)，
                            // 如果不填写此参数，默认为3天后过期。格式同start_time
        "max_send_num": xx,    // 可选，发送限速，每秒发送的最大条数。最小值1000
                            // 开发者发送的消息如果有请求自己服务器的资源，可以考虑此参数。
        "out_biz_no": "xx"    // 可选，开发者对消息的唯一标识，服务器会根据这个标识避免重复发送。
                            // 有些情况下（例如网络异常）开发者可能会重复调用API导致
                            // 消息多次下发到客户端。如果需要处理这种情况，可以考虑此参数。
                            // 注意, out_biz_no只对任务类消息生效。
    },
    "production_mode":"true/false",    // 可选，正式/测试模式。默认为true
                                    // 测试模式只会将消息发给测试设备。测试设备需要到web上添加。
                                    // Android: 测试设备属于正式设备的一个子集。
    "description": "xx",    // 可选，发送消息描述，建议填写。  
    //系统弹窗，只有display_type=notification生效
    "mipush": "true/false",    // 可选，默认为false。当为true时，表示MIUI、EMUI、Flyme系统设备离线转为系统下发
    "mi_activity": "xx",    // 可选，mipush值为true时生效，表示走系统通道时打开指定页面acitivity的完整包路径。
}
```

#### 消息发送-调用返回

在正常情况下，返回结果的HTTP状态码为200，错误情况下返回的HTTP状态码为400。 返回结果采用JSON格式，包含的参数有：

```json
{
    "ret":"SUCCESS/FAIL",
    "data": {
        // 当"ret"为"SUCCESS"时，包含如下参数:
        // 单播类消息(type为unicast、listcast、customizedcast且不带file_id)返回：
        "msg_id":"xx"

        // 任务类消息(type为broadcast、groupcast、filecast、customizedcast且file_id不为空)返回：
        "task_id":"xx"

        // 当"ret"为"FAIL"时,包含如下参数:
        "error_code":"xx",    // 错误码，详见附录I
        "error_msg":"xx"    // 错误信息
    }
}
```

错误码详见《HTTP常见Status Code及其含义》

### 任务类消息状态查询

#### 功能说明

任务类消息(type为broadcast、groupcast、filecast、customizedcast且file_id不为空)，可以通过task_id来查询当前的消息状态。

**注意**：非任务类消息，该接口会不生效。

#### 调用地址

POST (Content-Type: application/json)

http接口：http://msg.umeng.com/api/status?sign=mysign

https接口：https://msgapi.umeng.com/api/status?sign=mysign

签名(sign=mysign)的计算方式见《关于签名》

#### 调用参数

```json
{
    "appkey":"xx",        // 必填, 应用唯一标识
    "timestamp":"xx",    // 必填, 时间戳，10位或者13位均可，时间戳有效期为10分钟
    "task_id":"xx"        // 必填, 消息发送时, 从返回消息中获取的task_id
}
```

#### 状态查询-调用返回

在正常情况下，返回结果的HTTP状态码为200，错误情况下返回的HTTP状态码为400。 返回结果采用JSON格式，包含的参数有：

```json
{
    "ret":"SUCCESS/FAIL",
    "data": {
        // 当"ret"为"SUCCESS"时，包含如下参数:
        "task_id":"xx",
        "status": xx,    // 消息状态: 0-排队中, 1-发送中，2-发送完成，3-发送失败，4-消息被撤销，
                        // 5-消息过期, 6-筛选结果为空，7-定时任务尚未开始处理
        // Android消息，包含以下参数
        "sent_count":xx,    // 消息收到数
        "open_count":xx,    // 打开数
        "dismiss_count":xx    // 忽略数

        // iOS消息，包含以下参数
        "total_count": xx,    // 投递APNs设备数
        "sent_count": xx,    // APNs返回SUCCESS的设备数
        "open_count": xx    // 打开数

        // 当"ret"为"FAIL"时，包含参数如下:
        "error_code": "xx",    // 错误码详见附录I。
        "error_msg": "xx"    // 错误码详见附录I。
      }
}
```

**注意：**Android sent_count表示消息送达设备的数量。由于设备可能不在线，在消息有效时间内(expire_time)，设备上线后还会收到消息。 所以”sent_count”的数字会一直增加，直至到达消息过期时间后，该值不再变化。

### 任务类消息取消

#### 功能说明

任务类消息(type为broadcast、groupcast、filecast、customizedcast且file_id不为空)，可以进行撤销操作。

**注意：**撤销操作首先会从服务端尝试撤销（Android消息，排队中/发送中状态可以服务端撤销；iOS消息，排队中状态可以服务端撤销）；其次，**针对组建版，Android SDK 4.0及以上和iOS sdk 3.0及以上，会尝试从设备端撤销已展示的消息。**

#### 调用地址

POST (Content-Type: application/json)

http接口：http://msg.umeng.com/api/cancel?sign=mysign

https接口：https://msgapi.umeng.com/api/cancel?sign=mysign

签名(sign=mysign)的计算方式见《关于签名》

#### 调用参数

```json
{
    "appkey":"xx",        // 必填, 应用唯一标识
    "timestamp":"xx",    // 必填, 时间戳，10位或者13位均可, 时间戳有效期为10分钟
    "task_id":"xx"        // 必填, 消息发送时, 从返回消息中获取的task_id
}
```

#### 消息取消-调用返回

在正常情况下，返回结果的HTTP状态码为200，错误情况下返回的HTTP状态码为400。 返回结果采用JSON格式，包含的参数有：

```json
{
    "ret":"SUCCESS/FAIL",
    "data": {
        // 当"ret"为"SUCCESS"时
        "task_id":"xx"

        // 当"ret"为"FAIL"时，包含参数如下:
        "error_code": "xx",    // 错误码
        "error_msg": "xx"    // 错误详情
    }
}
```

### 文件上传

#### 功能说明

文件上传接口支持两种应用场景：

1. 发送类型为”filecast”的时候, 开发者批量上传device_token;
2. 发送类型为”customizedcast”时, 开发者批量上传alias。

上传文件后获取file_id, 从而可以实现通过文件id来进行消息批量推送的目的。

文件自创建起，服务器会保存两个月。开发者可以在有效期内重复使用该file-id进行消息发送。

**注意：**上传的文件不超过10M。

#### 调用地址

POST (Content-Type: application/json)

http接口：<http://msg.umeng.com/upload?sign=mysign>

https接口：<https://msgapi.umeng.com/upload?sign=mysign>

签名(sign=mysign)的计算方式参见《关于签名》

#### 调用参数

```json
{
    "appkey":"xx",        // 必填, 应用唯一标识
    "timestamp":"xx",    // 必填, 时间戳，10位或者13位均可, 时间戳有效期为10分钟
    "content":"xx"        // 必填, 文件内容, 多个device_token/alias请用回车符"\n"分隔。
}
```

**注意：**content文件内容建议不要超过10M，文件内容为开发者的device_token/alias，每行一个device_token/alias，由于换行符的特殊性，请将”\n”(或者”\r\n”) 显示置于每个device_token/alias之后，如：

```json
{
    "appkey":"xx",        // 必填, 应用唯一标识
    "timestamp":"xx",    // 必填, 时间戳，10位或者13位均可, 时间戳有效期为10分钟
    "content":"xx"        // 必填, 文件内容, 多个device_token/alias请用回车符"\n"分隔。
}
```

#### 文件上传-调用返回

```json
{
    "ret":"SUCCESS/FAIL",
    "data": {
        // 当"ret"为"SUCCESS"时
        "file_id":"xx"

        // 当"ret"为"FAIL"时，包含参数如下:
        "error_code": "xx",    //错误码
        "error_msg": "xx"    // 错误详情
    }
}
```

## 常见问题

### 添加/关闭IP白名单

添加IP：首先查看服务器的外网ip（可通过[myip](http://www.myip.cn/)查看），然后登录Web后台，在“应用信息”页面进行设置。

关闭IP：关闭“启用服务器IP地址”按钮，并保存即可。

### 调用API返回400错误

我们对于格式错误或其他原因导致发送失败的消息返回400，在返回的内容里面会有`error_code`和`error_msg`表明发送失败的原因（参见附录I）。

您需要在代码里面输出返回内容（java/php/python代码中显示返回内容可参考示例代码，其他语言的开发者可参考相关手册）。

### 消息推送接口的响应时间？调用推送API时超时应设置多久？

消息推送接口响应时间一般来说都不会超过2s，具体根据推送类型不同有一些差别，例如广播平均响应时间约1102.583ms，单播的响应时间约4.994ms。但是考虑到开发者的网络情况以及一些IO操作偶尔会耗时较长，我们推荐开发者将超时设置为**1分钟**。

### customizedcast中通过alias发送消息和通过file_id发送消息有什么区别？什么情况下使用file_id方式发送？

通过alias发送的消息使用单播方式发送，通过file_id发送的消息则需要在后台创建任务进行异步处理。

通常来说，通过file_id方式发送消息到达设备的延时会比通过alias方式发送消息的延时大。所以我们建议alias个数小于500个时使用alias方式发送，超过500个使用file_id方式发送。

### 已经发送完成的消息是否可以撤销？

任务类消息，可以进行撤销操作。

撤销操作首先会从服务端尝试撤销（Android消息，排队中/发送中状态可以服务端撤销；iOS消息，排队中状态可以服务端撤销）；其次，针对组建版，Android SDK 4.0及以上和iOS sdk 3.0及以上，会尝试从设备端撤销已展示的消息。

### out_biz_no是什么？什么情况下需要填写？

out_biz_no是开发者的消息标识，和消息一一对应，如果两条消息的out_biz_no相同，推送服务器认为是同一条消息。所以，如果发送多个msg key相同的消息,后发送的消息服务器不会下发。

如果开发者在sdk中调用了mPushAgent.setMergeNotificaiton(false)，服务端程序又在网络异常时进行了重试，就有可能造成同一条消息通过友盟服务器在用户手机上显示两次以上的情况。可以通过使用out_biz_no参数避免这种情况的发生。

## 示例

### unicast消息发送示例

```json
// Android
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"unicast",
    "production_mode":"false",
    "device_tokens":"xx(Android为44位)",
    "payload": {
        "display_type": "message",   // 消息，message
        "body": {
            "custom":"自定义custom"/{} // message类型只需填写custom即可，可以是字符串或JSON。
        }
    },
    "policy": {
        "expire_time": "2013-10-30 12:00:00"
    },
    "description":"测试单播消息-Android"
}

// iOS
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"unicast",
    "production_mode":"false",
    "device_tokens":"xx(iOS为64位)", 
    "payload": {
        "aps":{    // 苹果必填字段
            "alert":""/{    // 当content-available=1时(静默推送)，可选; 否则必填。
                            // 可为JSON类型和字符串类型
                "title":"title",
                "subtitle":"subtitle",
                "body":"body"
            }
        }
        "k1":"v1",    // 自定义key-value, key不可以是"d","p"
        "k2":"v2",
        ...
    },
    "policy": {
        "expire_time":"2013-10-30 12:00:00"
    },
    "description":"测试单播消息-iOS"
}
```

返回结果示例：

```json
// 返回成功
{
    "ret":"SUCCESS",
    "data": {
        "msg_id":"uu07343141897754408310"
    }
}

// 返回失败
{
    "ret":"FAIL",
    "data": {
        "error_code":"xxx" //错误码
        "error_msg":"xxx" //错误信息
    }
}
```

### listcast消息发送示例

```json
// Android
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"listcast",
    "device_tokens":"device1,device2,…", // 不能超过500个，多个device_token用英文逗号分隔
    "payload": {
        "display_type": "notification", // 通知，notification
        "body": {
            "ticker":"测试提示文字",
            "title":"测试标题",
            "text":"测试文字描述",
            "after_open":"go_app"
        }
    },
    "policy": {
        "expire_time": "2013-10-30 12:00:00"
    },
    "description":"测试列播通知-Android"
}

// iOS
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"listcast",
    "device_tokens":"device_token1,device_token2,...",    // 不能超过500个，多个device_token用英文逗号分隔
    "payload": {
        "aps": {    // 苹果必填字段
            "alert":""/{    // 当content-available=1时(静默推送)，可选; 否则必填。
                            // 可为JSON类型和字符串类型
            "title":"title",
            "subtitle":"subtitle",
            "body":"body"
        }
    },
    "k1":"v1",   // 自定义key-value, key不可以是"d","p"
    "k2":"v2",
    ...
    },
    "policy": {
        "expire_time":"2013-10-30 12:00:00"
    }
    "description":"测试列播消息-iOS"
}
```

返回结果示例：

```json
// 返回成功
{
    "ret":"SUCCESS",
    "data": {
        "msg_id":"uu07343141897754408310"
    }
}

// 返回失败
{
    "ret":"FAIL",
    "data": {
        "error_code":"xxx" //错误码
        "error_msg":"xxx" //错误信息
    }
}
```

### broadcast消息发送示例

```json`
// Android
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"broadcast", 
    "payload":
    {
        "display_type": "notification", // 通知，notification
        "body":
        {
            "ticker":"测试提示文字",
            "title":"测试标题",
            "text":"测试文字描述",
            "after_open" : "go_app"
        }
    },
    "policy":
    {
        "start_time": "2013-10-29 12:00:00", //定时发送
        "expire_time": "2013-10-30 12:00:00"
    },
    "description":"测试广播通知-Android"
}

// iOS
{
   "appkey":"你的appkey",
   "timestamp":"你的timestamp",
   "type":"broadcast",
   "payload":
   {
    "aps":{          // 苹果必填字段
        "alert":""/{ // 当content-available=1时(静默推送)，可选; 否则必填。
                     // 可为JSON类型和字符串类型
            "title":"title",
            "subtitle":"subtitle",
            "body":"body"
        } 
    }
    "k1":"v1",   // 自定义key-value
    "k2":"v2",
    ...
   },
   "policy":
   {
       "start_time": "2013-10-29 12:00:00", //定时发送
       "expire_time": "2013-10-30 12:00:00"
   },
   "description":"测试广播通知-iOS"
}
```

返回结果示例：

```json
// 返回成功
{
    "ret":"SUCCESS",
    "data": {
        "msg_id":"uu07343141897754408310"
    }
}

// 返回失败
{
    "ret":"FAIL",
    "data": {
        "error_code":"xxx" //错误码
        "error_msg":"xxx" //错误信息
    }
}
```

### groupcast消息发送示例

```json
// Android
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"groupcast",
    "filter":
    {
      "where": 
      {
        "and": [{"app_version": "1.0"}] // 发送给app_version为1.0的用户群
      }
    },
    "payload":
    {
        "display_type": "notification", // 通知，notification
        "body":
        {
            "ticker":"测试提示文字",
            "title":"测试标题",
            "text":"测试文字描述",
            "after_open": "go_url",
            "url": "http://message.umeng.com"
        }
    },
    "policy":
    {
        "expire_time": "2013-10-30 12:00:00"
    },
    "description":"测试组播通知-Android"
}

// iOS
{
   "appKey":"你的appkey",
   "timestamp":"你的timestamp",
   "type":"groupcast",
   "filter":
    {
      "where": 
      {
        "and": [{"app_version": "1.0"}]
      }
    },
   "payload":
   {
    "aps":{          // 苹果必填字段
        "alert":""/{ // 当content-available=1时(静默推送)，可选; 否则必填。
                     // 可为JSON类型和字符串类型
            "title":"title",
            "subtitle":"subtitle",
            "body":"body"
        } 
    }
    "k1":"v1",   // 自定义key-value
    "k2":"v2",
    ...
   },
   "policy":
   {
       "expire_time": "2013-10-30 12:00:00"
   },
   "description":"测试组播通知-iOS"   
}
```

**说明：**其中的filter条件表示向当前所有app_version是v1.0的应用客户端发送消息，其内容的使用语法示例请参考《过滤条件示例》

返回结果示例：

```json
// 返回成功
{
    "ret":"SUCCESS",
    "data": {
        "msg_id":"uu07343141897754408310"
    }
}

// 返回失败
{
    "ret":"FAIL",
    "data": {
        "error_code":"xxx" //错误码
        "error_msg":"xxx" //错误信息
    }
}
```

### customizedcast消息发送示例

1. 通过alias发送消息示例：

```json
 // Android
 {
     "appkey":"你的appkey",
     "timestamp":"你的timestamp",
     "type":"customizedcast", 
     "alias": "你的alias", //不能超过500个，多个alias以英文逗号风格
     "alias_type":"alias对应的type(SDK调用addAlias(alias,alis_type)接口指定的alias_type)",
     "payload":
     {
         "display_type": "notification", // 通知，notification
         "body":
         {
             "ticker":"测试提示文字",
             "title":"测试标题",
             "text":"测试文字描述",
             "after_open": "go_activity",
             "activity": "xxx"
         }
     },
     "policy":
     {
         "expire_time": "2013-10-30 12:00:00"
     },
     "description":"测试alias通知-Android"
 }

 // iOS
 {
    "appKey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"customizedcast",
    "alias": "你的alias", //不能超过500个，多个alias以英文逗号分隔。
    "alias_type":"alias对应的type",
    "payload":
    {
     "aps":{          // 苹果必填字段
         "alert":""/{ // 当content-available=1时(静默推送)，可选; 否则必填。
                      // 可为JSON类型和字符串类型
             "title":"title",
             "subtitle":"subtitle",
             "body":"body"
         } 
     }
     "k1":"v1",   // 自定义key-value
     "k2":"v2",
     ...
    },
    "policy":
    {   
        "expire_time": "2013-10-30 12:00:00"
    }
    "description":"测试alias通知-iOS"      
 }
```

返回结果示例：

```json
 // 返回成功
 {
     "ret":"SUCCESS",
     "data": {
         "msg_id":"uu07343141897754408310"
     }
 }

 // 返回失败
 {
     "ret":"FAIL",
     "data": {
         "error_code":"xxx" //错误码
         "error_msg":"xxx" //错误信息
     }
 }
```

2. 通过file_id方式发送消息示例：

```json
 // 1. 先通过文件上传接口获取文件id: 
 {
     "appkey":"你的appkey",
     "timestamp":"你的timestamp",
     "content":"alias1\nalias2\nalias3\n..." // 多个alias用回车符分隔，回车符需要显示出现。
 }

 // 返回结果:
 {
   "ret":"SUCCESS",
   "data":
   {
     "file_id":"PF212711418961495056"
   }
 }

 // 2. 再通过文件方式发送消息: 
 // Android
 {
     "appkey":"你的appkey",
     "timestamp":"你的timestamp",
     "type":"customizedcast", 
     "alias_type":"alias对应的type",
     "file_id": "PF8961384936199949", // 通过文件上传接口获得的file_id
     "payload":
     {
         "display_type": "notification", // 通知，notification
         "body":
         {
             "ticker":"测试提示文字",
             "title":"测试标题",
             "text":"测试文字描述",
             "after_open":"go_custom",
             "custom": {"key":"value",...}
         }
     },
     "policy":
     {
         "expire_time": "2013-10-30 12:00:00"
     },
     "description":"测试alias文件通知-Android"
 }

 // iOS
 {
    "appKey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"customizedcast",
    "alias_type":"alias对应的type(SDK添加的alias的时候，会带一个type)",
    "file_id": "PF8961384936199949", 
    "payload":
    {
     "aps":{          // 苹果必填字段
         "alert":""/{ // 当content-available=1时(静默推送)，可选; 否则必填。
                      // 可为JSON类型和字符串类型
             "title":"title",
             "subtitle":"subtitle",
             "body":"body"
         } 
     }
     "k1":"v1",   // 自定义key-value
     "k2":"v2",
     ...
    },
    "policy":
    { 
     "expire_time": "2013-10-30 12:00:00"
    }
    "description":"测试alias文件通知-iOS"      
 }
```

返回结果示例：

```json
 // 返回成功
 {
     "ret":"SUCCESS",
     "data": {
         "msg_id":"uu07343141897754408310"
     }
 }

 // 返回失败
 {
     "ret":"FAIL",
     "data": {
         "error_code":"xxx" //错误码
         "error_msg":"xxx" //错误信息
     }
 }
```

### filecast消息发送示例

```json
// 1. 先通过文件上传接口获取文件id: 
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "content":"device_token_1\ndevice_token_2\ndevice_token_3\n..." 
                            // 多个device_token用回车符分隔，回车符需要显示出现。
}

// 返回结果:
{
  "ret":"SUCCESS",
  "data":
  {
    "file_id":"PF8961384936199949"
  }
}

// 2. 再通过文件方式发送消息: 
// Android
{
    "appkey":"你的appkey",
    "timestamp":"你的timestamp",
    "type":"filecast", 
    "file_id": "PF8961384936199949", // 通过文件上传接口获得的file_id
    "payload":
    {
        "display_type": "notification", // 通知，notification
        "body":
        {
            "ticker":"测试提示文字",
            "title":"测试标题",
            "text":"测试文字描述",
            "after_open": "go_app"
        }
    },
    "policy":
    {
        "expire_time": "2013-10-30 12:00:00"
    },
    "description":"测试filecast文件通知-Android"
}

// iOS
{
   "appKey":"你的appkey",
   "timestamp":"你的timestamp",
   "type":"filecast",
   "file_id": "PF8961384936199949", 
   "payload":
   {
    "aps":{          // 苹果必填字段
        "alert":""/{ // 当content-available=1时(静默推送)，可选; 否则必填。
                     // 可为JSON类型和字符串类型
            "title":"title",
            "subtitle":"subtitle",
            "body":"body"
        } 
    }
    "k1":"v1",   // 自定义key-value
    "k2":"v2",
    ...
   },
   "policy":
   {   
      "expire_time": "2013-10-30 12:00:00"
   }
   "description":"测试filecast文件通知-iOS"      
}
```

返回结果示例：

```json
// 返回成功
{
    "ret":"SUCCESS",
    "data": {
        "msg_id":"uu07343141897754408310"
    }
}

// 返回失败
{
    "ret":"FAIL",
    "data": {
        "error_code":"xxx" //错误码
        "error_msg":"xxx" //错误信息
    }
}
```

## 过滤条件

### 目前开放的筛选字段

- “app_version”(应用版本)
- “channel”(渠道)
- “device_model”(设备型号)
- “province”(省)
- “tag”(用户标签)
- “country”(国家和地区) //“country”和”province”的类型定义请参照 附录J
- “language”(语言)
- “launch_from”(一段时间内活跃)
- “not_launch_from”(一段时间内不活跃)

我们的筛选条件非常灵活，支持逻辑上的and(与), or(或), not(非)操作, 以及这些操作的组合。具体请参照下面的示例。

### and条件示例

已注册的(registered_user)**并且**版本(app_version)是1.0的用户群，且这些用户在2014-11-15之后活跃过。

```json
"where": 
{
    "and": 
    [
      {"tag":"registered_user"}, // 开发者自定义tag
      {"app_version":"1.0"}, // app-version
      {"launch_from":"2014-11-15"} // X天活跃/不活跃
    ]
}
```

### or条件示例

自定义标签为“美剧”的用户**或者**自定义标签为“文艺”的用户

```json
"where":{
    "and":[
        {
        "or":[
            {"tag":"美剧"},
            {"tag":"文艺"}            ]
        }
    ]
}
```

### not条件示例

**未**注册的(registered_user)的用户群

```json
"where": 
{
  "and": 
  [
    {
      "not": 
      {
        "tag": "registered_user"
      }
    }
  ]
}
```

### and, or, not组合条件示例

发送给分渠道**非**360**或者**“版本号为1.2”**并且**“2014-11-15之后不活跃”的用户

```json
"where": 
{
  "and": 
  [
    {
      "or": 
      [
        {
          "not": 
          {
            "channel": "360"
          }
        },
        {
          "app_version": "1.2"
        }
      ]
    },
    {
      "not_launch_from": "2014-11-15"
    }
  ]
}
```

### 大于等于（>=）及小于等于（<=）组合条件示例

如果要选择推送给版本>=某版本或者<=某版本的设备，以筛选>=1.0的设备为例，可采用以下两种方法实现：

- 方法一：自己筛选出符合要求的各个版本。（官方建议方案）格式为：

  ```json
  {"and":[{"or":[{"app_version":">1.0"}]}]}
  ```

- 方法二：自己筛选出符合要求的各个版本。格式为：

  ```json
  {"and":[{"or":[{"app_version":"1.0"},{"app_version":"2.0"},{"app_version":"3.0"},{"app_version":"4.0"}]}]}
  ```

## 关于签名

为了确保用户发送的请求不被更改，我们设计了签名算法。该算法基本可以保证请求是合法者发送且参数没有被修改，但无法保证不被偷窥。 签名生成规则：

- 提取请求方法method（POST，全大写）；
- 提取请求url信息，包括Host字段的域名(或ip:端口)和URI的path部分。注意不包括path的querystring。比如<http://msg.umeng.com/api/send> 或者 <http://msg.umeng.com/api/status>;
- 提取请求的post-body；
- 拼接请求方法、url、post-body及应用的app_master_secret；
- 将D形成字符串计算MD5值，形成一个32位的十六进制（字母小写）字符串，即为本次请求sign（签名）的值；`Sign=MD5($http_method$url$post-body$app_master_secret);`

## HTTP常见Status Code及其含义

| 错误码 | 错误信息提示                                                 | Http Status Code |
| ------ | ------------------------------------------------------------ | ---------------- |
| 1000   | 请求参数没有appkey或为空值                                   | 400              |
| 1001   | 请求参数没有payload或为非法json                              | 400              |
| 1002   | 请求参数payload中, 没有body或为非法json                      | 400              |
| 1003   | payload.display_type为message时, 请求参数payload.body中, 没有custom字段 | 400              |
| 1004   | 请求参数payload中, 没有display_type或为空值                  | 400              |
| 1005   | 请求参数payload.body中, img格式有误, 需以http或https开始     | 400              |
| 1007   | payload.body.after_open为go_url时, 请求参数payload.body中, url格式有误, 需以http或https开始 | 400              |
| 1008   | payload.display_type为notification时, 请求参数payload.body中, 没有ticker参数 | 400              |
| 1009   | payload.display_type为notification时, 请求参数payload.body中, 没有title参数 | 400              |
| 1010   | payload.display_type为notification时, 请求参数payload.body中, 没有text参数 | 400              |
| 1014   | task_id对应任务没有找到                                      | 400              |
| 1015   | type为unicast或listcast时, 请求参数没有device_tokens或为空值 | 400              |
| 1016   | 请求参数没有type或为空值                                     | 400              |
| 1019   | 请求参数payload中, display_type值非法                        | 400              |
| 1020   | 应用组中尚未添加应用                                         | 400              |
| 1022   | payload.body.after_open为go_url时, 请求参数payload.body中, 没有url参数或为空 | 400              |
| 1024   | payload.body.after_open为go_activity时, 请求参数payload.body中, 没有activity或为空值 | 400              |
| 1026   | 请求参数payload中, extra为非法json                           | 400              |
| 1027   | 请请求参数payload中, policy为非法json                        | 400              |
| 1028   | task_id对应任务无法撤销                                      | 400              |
| 2000   | 该应用已被禁用                                               | 400              |
| 2002   | 请求参数policy中, start_time必须大于当前时间                 | 400              |
| 2003   | 请求参数policy中, expire_time必须大于start_time和当前时间    | 400              |
| 2004   | IP白名单尚未添加, 请到网站后台添加您的服务器IP或关闭IP白名单功能 | 400              |
| 2006   | Validation token不一致(PS: 此校验方法已废弃, 请采用sign进行校验) | 400              |
| 2007   | 未对请求进行签名                                             | 400              |
| 2008   | json解析错误                                                 | 400              |
| 2009   | type为customizedcast时, 请求参数没有alias、file_id或皆为空值 | 400              |
| 2016   | type为groupcast时, 请求参数没有filter或为非法json            | 400              |
| 2017   | 添加tag失败                                                  | 400              |
| 2018   | type为filecast时, 请求参数没有file_id或为空值                | 400              |
| 2019   | type为filecast时, file_id对应的文件不存在                    | 400              |
| 2021   | appkey不存在                                                 | 400              |
| 2022   | payload长度过长                                              | 400              |
| 2023   | 文件上传失败, 请稍后重试                                     | 400              |
| 2025   | 请求参数没有aps或为非法json                                  | 400              |
| 2027   | 签名不正确                                                   | 400              |
| 2028   | 时间戳已过期                                                 | 400              |
| 2029   | 请求参数没有content或为空值                                  | 400              |
| 2031   | filter格式不正确                                             | 400              |
| 2032   | 未上传生产证书, 请到Web后台上传                              | 400              |
| 2033   | 未上传开发证书, 请到Web后台上传                              | 400              |
| 2034   | 证书已过期                                                   | 400              |
| 2035   | 定时任务发送时, 证书已过期                                   | 400              |
| 2036   | 时间戳格式错误                                               | 400              |
| 2039   | 请求参数policy中, 时间格式必须是yyyy-MM-dd HH:mm:ss          | 400              |
| 2040   | 请求参数policy中, expire_time不能超过发送时间+7天            | 400              |
| 2046   | 请求参数policy中, start_time不能超过当前时间+7天             | 400              |
| 2047   | type为customizedcast时, 请求参数没有alias_type或为空值       | 400              |
| 2048   | type值须为unicast、listcast、filecast、broadcast、groupcast、groupcast中的一种 | 400              |
| 2049   | type为customizedcast时, 请求参数alias、file_id只可二选一     | 400              |
| 2050   | 发送频率超出限制                                             | 400              |
| 2052   | 请求参数没有timestamp或为空值                                | 400              |
| 2053   | 请求参数没有task_id或为空值                                  | 400              |
| 2054   | IP不在白名单中, 请到网站后台添加您的服务器IP或关闭IP白名单功能 | 400              |
| 5001   | 证书解析bundle id失败, 请重新上传                            | 400              |
| 5002   | 请求参数payload中p、d为友盟保留字段                          | 400              |
| 5007   | certificate_revoked错误                                      | 400              |
| 5008   | certificate_unkown错误                                       | 400              |
| 5009   | handshake_failure错误                                        | 400              |
| 5010   | 配置使用Token Auth, 但未上传p8证书                           | 400              |
| 6001   | 该app未开通服务端tag接口                                     | 400              |
| 6002   | 内部错误(iOS证书)                                            | 400              |
| 6003   | 内部错误(数据库)                                             | 400              |
| 6004   | 内部错误(TFS)                                                | 400              |

## 服务端代码调用示例

- PHP SDK v1.4（2016-09-29） [下载](https://files.alicdn.com/tpsservice/564502d414dc1d84929e7eebdd0329e0.zip)
- Java SDK v1.5（2015-11-13） [下载](https://files.alicdn.com/tpsservice/ff7c6facc6e259adabc26b89cb898cd9.zip)
- python SDK v1.0 beta（2016-8-19） [下载](https://files.alicdn.com/tpsservice/629948dc626cf3ef3bad56d12217207d.zip)

# react native接口说明

## 接口说明

首先需要引入`PushUtil`文件：

```javascript
import PushUtil from './PushUtil'
```

### 添加tag

```js
 PushUtil.addTag(tag,(code,remain) =>{

        })
```

- tag 此参数为tag
- callback 第一个参数code为错误码，当为0时标记成功。remain为remain值

### 删除tag

```js
  PushUtil.deleteTag(tag,(code,result) =>{

        })
```

- tag 此参数为tag
- callback 第一个参数code为错误码，当为0时标记成功。remain为remain值

### 展示tag

```js
  PushUtil.listTag((code,result) =>{

        })
```

- callback 第一个参数code为错误码，当为0时标记成功。result为一个数组类型，内容为所有tag

### 添加Alias

```js
PushUtil.addAlias(alias,type,(code) =>{
        })
```

- alias 此参数为alias
- type 此参数为alias type

### 添加额外Alias

```js
PushUtil.addExclusiveAlias(alias,type,(code) =>{

        })
```

- alias 此参数为alias
- type 此参数为alias type

### 删除Alias

```js
PushUtil.deleteAlias(alias,type,(code) =>{

        })
```

- alias 此参数为alias
- type 此参数为alias type

### appinfo

```js
PushUtil.appInfo((result) =>{

        })
```

- callback result为一个字符串类型，标记结果