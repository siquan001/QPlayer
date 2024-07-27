# QPlayer

一个可爱的js音乐播放器

## 使用方法

1. 下载 [qplayer-min.js](./qplayer-min.js) 和 [qplayer.base-min.css](./qplayer.base-min.css)
2. 将qplayer.min.js和qplayer.base-min.css引入到HTML中。
3. 按如下配置
    ```javascript
    var qp = new QPlayer({
        container: document.getElementById('qp'), // 嵌入QPlayer的容器，应该为一个div
        color:'light', // 主题颜色，可填'light'、'dark'或'auto'，auto即为根据歌曲封面而定，默认light
        colorfulBg:false, // 是否将封面主题色设为背景
        start:0, // 最开始播放的歌曲序号，默认为0，从0开始，填'random'则随机播放
        sort:'normal', // 默认播放顺序，'random'随机，'normal'顺序，'repeat'单曲循环
        autoplay:false, // 自动播放
        canChangeSort:true, // 是否可以改变播放顺序
        canShowSongList:true, // 是否显示歌单
        songList:[{
            name:"歌曲名称",
            artist:"歌手",
            img:"歌曲封面url", // 若为动态获取，img,url,lrc这里不填，然后用audioBack返回
            url:"歌曲url",
            lrc:"歌曲歌词（lrc格式字符串）"
        },...],
        audioBack:function(index,toRes){
            // 动态请求链接;
            toRes.audio(audioUrl);
            toRes.cover(coverUrl);
            toRes.lyric(lyricText);

            // 失败则调用
            toRes.err();
            return {
                abort:function(){
                    // 取消请求等
                }
            }
        }
    });
    ```
4. 可以使用以下方法来控制播放器
        
    ```javascript
    qp.play(4) // 播放指定序号的歌曲
    qp.play() // 播放
    qp.pause() // 暂停
    qp.last() // 上一曲
    qp.next() // 下一曲
    ```

## 示例

[https://siquan001.github.io/QPlayer/](https://siquan001.github.io/QPlayer/)