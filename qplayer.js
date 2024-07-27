(function(){
    console.log('Welcome to use QPlayer 1.0.0');
    /**
     * @class QPlayer
     * @param {Object} details 
     * @param {HTMLElement} details.container
     * @param {Array} details.songList
     * @param {Function} details.audioBack?
     */
    function QPlayer(details){
        initAttr(details,this);
        initContainer(this.container,this);
        this.gClassName();
        if(details.start=='random'){
            this.play(Math.floor((Math.random()*this.length)))
        }else if(typeof details.start=='number'&&details.start<=this.length-1){
            this.play(parseInt(details.start));
        }else{
            this.play(0);
        }
    }

    QPlayer.prototype={
        play:function(index){
            if(typeof index!='number'||index<0){
                this.audio.play();
            }else{
                if(this.rs.length>0){
                    this.rs.forEach(function(r){r.abort()});
                    this.rs=[];
                }
                index=parseInt(index);
                if(this.canShowSongList!=false){
                    var acteditem=this.container.querySelector('.music-list .item.active');
                    acteditem&&acteditem.classList.remove('active');
                    try {
                        this.container.querySelectorAll('.music-list .item')[index].classList.add('active');
                    } catch (error) {}
                    if(this.showmusiclist){
                        var _acteditem=this.container.querySelector('.music-list .item.active');
                        scrollIntoView(_acteditem);
                    }
                }
                
                this.audio.pause();
                this.playIndex=index;
                var tm=this.songList[index];
                this.name_f.innerText=tm.name;
                this.name_f.title=tm.name;
                this.artist_f.innerText=tm.artist;
                this.artist_f.title=tm.artist;
                this.cover.src='https://image.gumengya.com/i/2023/10/15/652b46cf15392.png';
                this.loading=true;
                if(this.mode==0){
                    var _=this;
                    _.rs.push(_.audioBack(index,{
                        cover:function(url){
                            _.cover.src=url;
                            if(_.colorL=='auto'){
                                colorfulImg(url,function(color,islight){
                                    if(_.colorfulBg){
                                        _.container.style.backgroundColor=color;
                                    }
                                    _.color=islight?'light':'dark';
                                    _.gClassName();
                                },_)
                            }
                            
                        },
                        audio:function(url){
                            _.audio.src=url;
                        },
                        lyric:function(lrc){
                            _.lrc=parseLrc(lrc);
                        },
                        err:function(){
                            console.log('A Error was caused when this song was playing',tm,index);
                            setTimeout(function(){
                                _.next();
                            },5000)
                        }
                    }));
                }else{
                    this.cover.src=tm.img;
                    this.audio.src=tm.url;
                    this.lrc=parseLrc(tm.lrc);
                    var _=this;
                    if(_.colorL=='auto'){
                        colorfulImg(tm.img,function(color,islight){
                            if(_.colorfulBg){
                                _.container.style.backgroundColor=color;
                            }
                            _.color=islight?'light':'dark';
                            _.gClassName();
                        },_)
                    }
                }
            }
            this.gClassName();
        },
        pause:function(){
            this.audio.pause();
        },
        next:function(){
            if(this.playSort=='random'){
                this.play(Math.floor((Math.random()*this.length)));
            }else{
                this.play(this.playIndex==this.length-1?0:this.playIndex+1);
            }
        },
        last:function(){
            if(this.playSort=='random'){
                this.play(Math.floor((Math.random()*this.length)));
            }else{
                this.play(this.playIndex==0?this.length-1:this.playIndex-1);
            }
        },
        setSort:function(sort){
            var sorts=['normal','repeat','random'];
            this.playSort=sorts[sort];
            this.playSortIndex=sort;
            this.gClassName();
        },
        gClassName:function(){
            this.container.className=this.oldClassName+(this.showmusiclist?' show-musiclist':'')+(this.color=='dark'?' dark':'')+(this.loading?' loading':'')+(this.showLrc?' showlrc':'')+(this.audio.paused?'':' playing')+' sort-'+this.playSort
        }
    }

    function initContainer(container,_this){
        container.classList.add('qplayer');
        _this.oldClassName=container.className;
        container.innerHTML='<audio class="qp-audio"></audio><div class="bg"></div><div class="zl"><div class="img"><div class="playing-anim"><div></div><div></div><div></div></div><img src="https://image.gumengya.com/i/2023/10/15/652b46cf15392.png" alt=""></div><div class="message"><div class="glc"><div class="songdata"><div class="name">Song Name</div><div class="artist">Song Artist</div></div><div class="lrc"></div><div class="controls"><div class="last-btn btn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z"></path></svg></div><div class="play-btn btn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="pause" viewBox="0 0 16 16"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"></path></svg><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="play" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg></div><div class="next-btn btn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z"></path></svg></div></div></div><div class="blc"><div class="range"><div class="a"></div><div class="b"></div></div><div class="time">00:00/00:00</div><div class="sort-btn btn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="random" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/></svg><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="repeat" viewBox="0 0 16 16"><path d="M11 4v1.466a.25.25 0 0 0 .41.192l2.36-1.966a.25.25 0 0 0 0-.384l-2.36-1.966a.25.25 0 0 0-.41.192V3H5a5 5 0 0 0-4.48 7.223.5.5 0 0 0 .896-.446A4 4 0 0 1 5 4zm4.48 1.777a.5.5 0 0 0-.896.446A4 4 0 0 1 11 12H5.001v-1.466a.25.25 0 0 0-.41-.192l-2.36 1.966a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192V13h6a5 5 0 0 0 4.48-7.223Z"></path><path d="M9 5.5a.5.5 0 0 0-.854-.354l-1.75 1.75a.5.5 0 1 0 .708.708L8 6.707V10.5a.5.5 0 0 0 1 0z"></path></svg><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="normal" viewBox="0 0 16 16"><path d="M11 4v1.466a.25.25 0 0 0 .41.192l2.36-1.966a.25.25 0 0 0 0-.384l-2.36-1.966a.25.25 0 0 0-.41.192V3H5a5 5 0 0 0-4.48 7.223.5.5 0 0 0 .896-.446A4 4 0 0 1 5 4zm4.48 1.777a.5.5 0 0 0-.896.446A4 4 0 0 1 11 12H5.001v-1.466a.25.25 0 0 0-.41-.192l-2.36 1.966a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192V13h6a5 5 0 0 0 4.48-7.223Z"></path></svg></div><div class="lrc-btn btn"><span>词</span></div><div class="list-btn btn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2"></path><path fill-rule="evenodd" d="M12 3v10h-1V3z"></path><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z"></path><path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"></path></svg></div></div></div></div><div class="music-list"></div>'
        _this.audio=container.querySelector('audio.qp-audio');
        _this.cover=container.querySelector('.img img');
        _this.name_f=container.querySelector('.songdata .name');
        _this.artist_f=container.querySelector('.songdata .artist');

        if(_this.canChangeSort==false){
            container.querySelector('.sort-btn').classList.add('disabled');
        }
        if(_this.canShowSongList==false){
            container.querySelector('.list-btn').classList.add('disabled');
        }else{
            var mlf=container.querySelector('.music-list');
            _this.songList.forEach(function(song,i){
                var ite=document.createElement('div');
                ite.classList.add('item');
                ite.innerHTML='<span class="_index">'+i+'</span>'+'<span class="_title"></span>'
                mlf.append(ite);
                ite.querySelector('._title').innerText=ite.title=song.artist+' - '+song.name;
                ite.onclick=function(){
                    _this.play(parseInt(this.querySelector('._index').innerHTML));
                }
            })
        }
        on(_this.cover,'error',function(){
            if(this.src!='https://image.gumengya.com/i/2023/10/15/652b46cf15392.png'){
                this.src='https://image.gumengya.com/i/2023/10/15/652b46cf15392.png';
            }
        })
        on(_this.audio,'play',function(){
            _this.gClassName();
        })
        on(_this.audio,'pause',function(){
            _this.gClassName();
        })
        on(_this.audio,'canplay',function(){
            _this.loading=false;
            _this.gClassName();
            if(_this._firstPlayed||_this.autoplay){
                try {
                    this.play();
                } catch (error) {
                    
                }
            }else{
                _this._firstPlayed=true;
            }
            
        })
        on(_this.audio,'ended',function(){
            if(_this.playSort=='repeat'){
                this.currentTime=0;
                this.play();
            }else{
                _this.next();
            }
        })

        on(_this.audio,'waiting',function(){
            console.log('waiting');
            _this.loading=true;
            _this.gClassName();
        })
        on(_this.audio,'playing',function(){
            _this.loading=false;
            _this.gClassName();
        })

        var range_a=container.querySelector('.range .a');
        var time_f=container.querySelector('.time');
        var range_b=container.querySelector('.range .b');
        var _d=false;
        on(_this.audio,'timeupdate',function(){
            time_f.innerText=b0(this.currentTime/60)+':'+b0(this.currentTime%60)+'/'+b0(this.duration/60)+":"+b0(this.duration%60);
            var l='';
            for(var k in _this.lrc){
                if(this.currentTime>=k){
                    l=_this.lrc[k];
                }
            }
            container.querySelector('.lrc').innerText=l;
            if(_d)return;
            range_a.style.width=this.currentTime/this.duration*100+'%';
            range_b.style.left='calc('+(this.currentTime/this.duration*100)+'% - 5px)';
        })
        on(container.querySelector('.play-btn'),'click',function(){
            _this.audio.paused?_this.play():_this.pause();
        })
        on(container.querySelector('.lrc-btn'),'click',function(){
            _this.showLrc=!_this.showLrc;
            _this.gClassName();
        })
        on(container.querySelector('.last-btn'),'click',function(){
            _this.last();
        })
        on(container.querySelector('.next-btn'),'click',function(){
            _this.next();
        })
        on(container.querySelector('.sort-btn'),'click',function(){
            _this.setSort(_this.playSortIndex==2?0:_this.playSortIndex+1);
        })
        on(container.querySelector('.list-btn'),'click',function(){
            _this.showmusiclist=!_this.showmusiclist;
            _this.gClassName();
            if(_this.showmusiclist){
                var acteditem=_this.container.querySelector('.music-list .item.active');
                if(acteditem){
                    scrollIntoView(acteditem)
                }
            }
            
        })

        on(container.querySelector('.range'),'click',function(e){
            var x=e.pageX,b=this.getBoundingClientRect();
            _this.audio.currentTime=(x-b.left)/b.width*_this.audio.duration;
        })

        on(range_b,'mousedown',function(e){
            var b=container.querySelector('.range').getBoundingClientRect();
            _d=true;
            document.addEventListener('mousemove',mv);
            document.addEventListener('mouseup',mu);
            function mv(e){
                var x=e.pageX,d=x-b.left;
                if(d<0){d=0}else if(d>b.width){d=b.width}
                range_a.style.width=d/b.width*100+'%';
                range_b.style.left='calc('+(d/b.width*100)+'% - 5px)';
            }
            function mu(e){
                _d=false;
                var x=e.pageX,d=x-b.left;
                if(d<0){d=0}else if(d>b.width){d=b.width}
                _this.audio.currentTime=d/b.width*_this.audio.duration;
                document.removeEventListener('mousemove',mv);
                document.removeEventListener('mouseup',mu);
            }
        })
        on(range_b,'touchstart',function(e){
            var b=container.querySelector('.range').getBoundingClientRect(),x;
            _d=true;
            document.addEventListener('touchmove',mv);
            document.addEventListener('touchend',mu);
            function mv(e){
                x=e.targetTouches[0].pageX,d=x-b.left;
                if(d<0){d=0}else if(d>b.width){d=b.width}
                range_a.style.width=d/b.width*100+'%';
                range_b.style.left='calc('+(d/b.width*100)+'% - 5px)';
            }
            function mu(e){
                _d=false;
                var d=x-b.left;
                if(d<0){d=0}else if(d>b.width){d=b.width}
                _this.audio.currentTime=d/b.width*_this.audio.duration;
                document.removeEventListener('touchmove',mv);
                document.removeEventListener('touchend',mu);
            }
        })
    }

    function b0(a){
        a=isNaN(a)?0:a;
        a=parseInt(a);
        return a<10?'0'+a:a;
    }

    function on(el,ev,fn){
        el.addEventListener(ev,fn);
    }

    function initAttr(details,_this){
        if(!(details.container instanceof HTMLElement)){
            throw new Error('QPlayer need a HTMLElement container to run.')
        }else{
            _this.container=details.container;
        }

        if(Array.isArray(details.songList)){
            _this.songList=details.songList;
        }else{
            throw new Error('QPlayer need a song list to play.')
        }

        if(typeof details.audioBack=='function'){
            _this.mode=0;
            _this.audioBack=details.audioBack;
        }else{
            _this.mode=1;
        }

        if(details.sort){
            var sorts=['normal','repeat','random'];
            var indexd=sorts.indexOf(details.sort);
            if(indexd==-1){
                indexd=0;
            }
            _this.playSort=sorts[indexd];
            _this.playSortIndex=indexd;
        }else{
            _this.playSort='normal';
            _this.playSortIndex=0;
        }
        
        _this.lrc={0:"正在加载歌词..."};
        _this.length=_this.songList.length;
        _this.showLrc=false;
        _this.loading=false;
        _this.autoplay=details.autoplay;
        _this.colorL=details.color||'light';
        _this.color=details.color||'light';
        _this.colorfulBg=details.colorfulBg;
        _this.canChangeSort=details.canChangeSort;
        _this.canShowSongList=details.canShowSongList;
        _this.rs=[];
    }

    function parseLrc(lrc) {
        lrc=lrc||"[00:00.00] 暂无歌词";
        var oLRC = [];
        if (lrc.length == 0) return;
        var lrcs = lrc.split('\n');//用回车拆分成数组
        for (var i in lrcs) {//遍历歌词数组
          lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
          var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
          var s = t.split(":");//分离:前后文字
          if (!isNaN(parseInt(s[0]))) { //是数值
            var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，可能有多个
            var start = 0;
            for (var k in arr) {
              start += arr[k].length; //计算歌词位置
            }
            var content = lrcs[i].substring(start);//获取歌词内容
            for (var k in arr) {
              var t = arr[k].substring(1, arr[k].length - 1);//取[]间的内容
              var s = t.split(":");//分离:前后文字
              oLRC.push({//对象{t:时间,c:歌词}加入ms数组
                t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
                c: content
              });
            }
          }
        }
        oLRC.sort(function (a, b) {//按时间顺序排序
          return a.t - b.t;
        });
        var r = {};
        oLRC.forEach(function (a) {
          r[a.t] = a.c;
        })
        return r;
      }

    /**
   * @param {string} url 图片链接
   * @param {function} cb 回调函数，参数为颜色字符串和是否为亮色
   * @description 获取图片主题色
   * @author BrownHu
   * @link https://juejin.cn/post/6844903678231445512
   * @from 稀土掘金
   * @note 对于一些地方做了修改和适配，对无法获取的图片使用https://api.qjqq.cn/api/Imgcolor siquan001
   */
  function colorfulImg(img,cb,_){
    if(img.indexOf('y.gtimg.cn')!=-1){
      d();
      return;
    }
    let imgEl=document.createElement('img');
    imgEl.src=img;
    imgEl.crossOrigin = 'Anonymous';
    imgEl.onload=function(){
      try{
        let canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        height,width,length,data, 
        i = -4,
        blockSize = 50,
        count = 0,
        rgb = {r:0,g:0,b:0}
        height = canvas.height = imgEl.height
        width = canvas.width = imgEl.width
        context.drawImage(imgEl, 0, 0);
        data = context.getImageData(0, 0, width, height).data
        length = data.length
        while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data[i];
        rgb.g += data[i+1];
        rgb.b += data[i+2];
        }
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);
        cb('rgba('+rgb.r+','+rgb.g+','+rgb.b+',.5)',(rgb.r+rgb.g+rgb.b)/3>128);
      }catch(e){
        d();
      }
    }
    imgEl.onerror=function(){
      d();
    }
    function d(){
      _.rs.push(xhr('https://api.qjqq.cn/api/Imgcolor?img='+img,function(n){
          if(!n){
            cb('rgba(0,0,0,0)',-1);
          }else{
            var h=n.RGB.slice(1);
            var r=parseInt(h.substring(0,2),16);
            var g=parseInt(h.substring(2,4),16);
            var b=parseInt(h.substring(4,6),16);
            cb('rgba('+r+','+g+','+b+',.5)',(r+g+b)/3>128);
          }
        }))
    }
  }
  function xhr(url, cb) {
    // if(url.indexOf('api.epdd.cn')!=-1) url='https://util.siquan.tk/api/cors?url='+encodeURIComponent(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    var timeoutreq = setTimeout(function () {
        xhr.abort();
        cb(false);
    }, 5000)
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            k = xhr.responseText;
            try {
                k = JSON.parse(k);
            } catch (e) {

            }
            clearTimeout(timeoutreq);
            cb(k)
        } else if (xhr.status > 400) {
            clearTimeout(timeoutreq);
            cb(false);
        }

    };
    xhr.onerror = function () {
        clearTimeout(timeoutreq);
        cb(false);
    }
    try {
        xhr.send();
    } catch (e) { }
    return {
        abort: function () {
            xhr.abort();
        }
    }
}
    function scrollIntoView(acteditem){
        var index=parseInt(acteditem.querySelector('span._index').innerText.trim());
        var p=acteditem.parentElement;
        var h=index*30-(p.clientHeight/2)-15;
        if(p.scrollHeight<h){
            h=p.scrollHeight;
        }else if(h<0){
            h=0;
        }
        p.scrollTo({
            top:h,
            behavior:"smooth"
        });
    }

    window.QPlayer=QPlayer;
})();