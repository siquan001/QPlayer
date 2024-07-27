var musicapi = {
    cl:function cl(u){
      var url=new URL(u);
      url.protocol='https:'
      url.host='ws.stream.qqmusic.qq.com';
      return url.href;
    },
    get: function (details, callback) {
      var r,k=0,errs={qq:{error:null},kugou:{error:null},netease:{error:null}};
      details.def=details.def?details.def:{};
      if(details.name){
        details.def.title=details.def.title?details.def.title:(details.artist+'-'+details.name);
        details.def.songname=details.def.songname?details.def.songname:details.name;
        details.def.artist=details.def.artist?details.def.artist:details.artist;
      }
      
      if(details.def.lrcstr){
        details.def.lrc=this.parseLrc(details.def.lrcstr);
      }
      function checkUrl(url,cb){
        var audio=document.createElement('audio');
        audio.src=url;
        audio.onloadedmetadata=function(){
          cb(true);
        }
        audio.onerror=function(){
          cb(false);
        }
      }
  
      var sp={
        qq:[details.qq && details.qq.mid,function(){
          r = musicapi._qq(details.qq.mid, function (res) {
            if (res.error) {
              errs.qq=res;
              k++;
              g();
              return;
            }else{
              callback(musicapi._compareDef(res, details.def));
            }
  
          });
        }],
        netease:[details.netease && details.netease.id,function(){
          r = musicapi._netease(details.netease.id, function (res) {
            if (res.error) {
              errs.netease=res;
              k++;
              g();
              return;
            }else{
              checkUrl(res.url,function(ok){
                if(ok){
                  callback(musicapi._compareDef(res, details.def));
                }else{
                  errs.netease=res;
                  k++;
                  g();
                }
              })
            }
          });
        }],
        kugou:[details.kugou && details.kugou.hash,function(){
          r = musicapi._kugou(details.kugou.hash, details.kugou.album_id, function (res) {
            console.log(res);
            if (res.error||!res.url) {
              errs.kugou=res;
              k++;
              g();
              return;
            }else{
              callback(musicapi._compareDef(res, details.def));
            }
          });
        }],
        none:[true,function(){
          if(k==0){
            callback(details.def)
          }else{
            console.log(errs);
            callback({
              error:"QQ:"+errs.qq.error+"\nKugou:"+errs.kugou.error+"\nNetease:"+errs.netease.error,
              errs:errs
            })
          }
        }]
      }
      var def_req_sort=['netease','qq','kugou'];
      if(details.firstReq&&def_req_sort.indexOf(details.firstReq)!=-1){
        def_req_sort.splice(def_req_sort.indexOf(details.firstReq),1);
        def_req_sort.unshift(details.firstReq);
      }
      function g(){
        for(var i=k;i<4;i++){
          if(sp[def_req_sort[i]][0]){
            sp[def_req_sort[i]][1]();
            break;
          }
        }
      }
      g()
      return r;
    },
    search: function (keyword, cb, details={}) {
      if(typeof details!=='object'||!details){
        details={}
      }
      if(details.type=='qq'){
        return musicapi._qq_search(keyword, cb, details);
      }else if(details.type=='netease'){
        return musicapi._netease_search(keyword, cb, details);
      }else{
        return musicapi._kugou_search(keyword, cb, details);
      }
    },
    _kugou: function (hash, album_id, cb) {
      var url = "https://api.gumengya.com/Api/KuGou?format=json&id=" + hash.toUpperCase()
      var a = musicapi._request(url, function (res) {
        if (res.code == 200) {
          cb({
            title: res.data.author+' - '+res.data.title,
            songname: res.data.title,
            artist: res.data.author,
            lrc: musicapi.parseLrc(res.data.lrc),
            url: res.data.url,
            album: '',
            img: res.data.pic.replace('/150',''),
            lrcstr: res.data.lrc,
            minipic:res.data.pic
          });
        } else {
          cb({
            error: '获取歌曲失败',
            code: res.err_code
          })
        }
      });
      return a;
    },
    _qq: function (mid, cb) {
      var c = 0, d = {},b;
      var a = musicapi._request('https://api.gumengya.com/Api/Tencent?format=json&id=' + mid, function (res) {
        if (res == false || !res.data) {
          a = musicapi._jsonp('https://api.vkeys.cn/V1/Music/Tencent?q=8&mid=' + mid+'&method=jsonp',_d2)
          function ba(r){
            var e = {
              title: r.data.singer + ' - ' + r.data.song,
              songname: r.data.song,
              artist: r.data.singer,
              url: musicapi.cl(r.data.url),
              album: r.data.album,
              img: r.data.cover,
            };
            for (var k in e) {
              d[k] = e[k];
            }
            c++;
            if (c == 2) {
              cb(d);
            }
          }
          b = musicapi._jsonp('https://api.vkeys.cn/v1/Music/Tencent/Lyric?mid=' + mid+'&method=jsonp', _d);
          var tim=setTimeout(function(){
            _d(false);
          },5000)
          var tim2=setTimeout(function(){
            _d2(false);
          },5000)
  
            function _d2(r) {
            clearTimeout(tim2);
            if (r == false || r.code != 200) {
              cb({
                error: '获取歌曲失败',
                code: 10000
              })
              a.abort();
            } else {
              ba(r);
            }
          }
          function _d(r){
            clearTimeout(tim);
            console.log(r);
            if (r == false || r.code != 200) {
              d.nolrc=true;
              d.lrc = { 0: "歌词获取失败" }
              d.lrcstr = '[00:00.00] 歌词获取失败'
            } else {
              d.lrc = musicapi.parseLrc(r.data.lrc);
              d.lrcstr = r.data;
            }
            c++;
            if (c == 2) {
              cb(d);
            }
          }
          
        } else {
          cb({
            title: res.data.author + ' - ' + res.data.title,
            songname: res.data.title,
            artist: res.data.author,
            lrc: musicapi.parseLrc(res.data.lrc),
            url: musicapi.cl(res.data.url),
            album: '',
            img: res.data.pic,
            lrcstr: res.data.lrc,
          });
        }
      })
      return {
        abort: function () {
          a.abort();
          b&&b.abort();
        }
      };
    },
    _netease: function (id, cb) {
      var c = 0, d = {},b;
      var a = musicapi._request('https://api.gumengya.com/Api/Netease?format=json&id=' + id, function (res) {
        if (res == false || !res.data) {
          a = musicapi._jsonp('https://api.vkeys.cn/V1/Music/Netease?q=8&id=' + id+'&method=jsonp', function (r) {
            if (r == false || r.code != 200) {
              cb({
                error: '获取歌曲失败',
                code: 10000
              })
              b.abort();
            } else {
              var e = {
                title: r.data.singer + ' - ' + r.data.song,
                songname: r.data.song,
                artist: r.data.singer,
                url: r.data.url,
                album: r.data.album,
                img: r.data.cover,
                lrc : { 0: "歌词获取失败" },
                lrcstr : '[00:00.00] 歌词获取失败'
              };
              cb(d);
            }
          })
          
        } else {
          cb({
            title: res.data.author + ' - ' + res.data.title,
            songname: res.data.title,
            artist: res.data.author,
            lrc: musicapi.parseLrc(res.data.lrc),
            url: res.data.url.replace('https://','http://'),
            album: '',
            img: res.data.pic,
            lrcstr: res.data.lrc,
          });
        }
      })
      return {
        abort: function () {
          a.abort();
          b&&b.abort();
        }
      };
    },
    _request: function (url, cb) {
      // if(url.indexOf('api.epdd.cn')!=-1) url='https://util.siquan.tk/api/cors?url='+encodeURIComponent(url);
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      var timeoutreq=setTimeout(function(){
        xhr.abort();
        cb(false);
      },5000)
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          k=xhr.responseText;
          try {
            k=JSON.parse(k);
          } catch (e) {
            
          }
          clearTimeout(timeoutreq);
          cb(k)
        }else if (xhr.status > 400) {
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
    },
    _jsonpdl:[],
    _jsonpsc:null,
    _jsonp: function (url, cb, cbname,fnname) {
      var i=Math.random();
      fnname = cbname || 'callback';
      this._jsonpdl.push([url,cb,cbname,fnname,i]);
      if(this._jsonpdl.length>1){
        console.log('wait',url);
        return;
      }
      console.log('do',url);
      function d(url,cb,cbname,fnname){
        var script = document.createElement('script');
        var urlm = url + (url.indexOf('?') >= 0 ? '&' : '?') + (cbname || 'callback') + '=' + fnname;
        script.src = urlm;
        window[fnname] = function () {
          delete window[fnname];
          cb.apply(null, arguments);
          musicapi._jsonpdl.shift();
          if(musicapi._jsonpdl.length>0){
            d.apply(null,musicapi._jsonpdl[0]);
            console.log('do',musicapi._jsonpdl[0][0]);
          }
        }
        document.body.appendChild(script);
        script.onload = function () {
          document.body.removeChild(script);
        }
        script.onerror=function(){
          cb(false);
          document.body.removeChild(script);
        }
        musicapi._jsonpsc=script;
      }
      
      d(url,cb,cbname,fnname);
      return {
        abort: function () {
          if(musicapi._jsonpdl[0]==i){
            try {
              delete window[fnname];
              var script=musicapi._jsonpsc;
              script.remove();
              script = null;
            } catch (e) {/* script 因为document.body.innerHTML改变或已被删除 */ }
          }else{
            for(var mi=0;mi<musicapi._jsonpdl.length;mi++){
              if(musicapi._jsonpdl[mi][4]==i){
                musicapi._jsonpdl.splice(mi,1);
              }
            }
          }
         
        }
      }
    },
    _kugou_search: function (keyword, cb, details) {
      var url = 'https://mobiles.kugou.com/api/v3/search/song?format=jsonp&keyword=' + encodeURI(keyword) + '&page=' + (details.page||1) + '&pagesize='+(details.pagesize||30)+'&showtype=1';
      var a=musicapi._jsonp(url, function (data) {
        var res = {
          total: data.data.total,
          page: details.page||1,
          songs: [],
        }
        data.data.info.forEach(function (song) {
          var pushed={
            name: song.songname,
            artist: song.singername,
            kugou:{
              hash: song.hash,
              album_id: song.album_id,
              ispriviage: song.privilege >= 10,
            }
          };
          if(song.filename.match(/【歌词 : .*】/)){
            var matched=song.filename.match(/【歌词 : .*】/);
            pushed.title=song.filename.replace(matched[0], '');
            pushed.matchLyric=matched[0].replace('【歌词 : ', '').replace('】', '');
          }else{
            pushed.title=song.filename;
          }
          res.songs.push(pushed);
        });
        cb(res);
      })
      return a;
    },
    _qq_search: function (keyword, cb, details) {
      var url = 'https://api.lolimi.cn/API/yiny/?word='+encodeURIComponent(keyword)+'&num='+(details.pagesize||30)+'&page='+(details.page||1);
      var a=musicapi._request(url, function (data) {
        var res = {
          total: Infinity,
          page: details.page||1,
          songs: [],
        }
        data.data.forEach(function (song) {
          var pushed={
            name: song.song,
            artist: song.singer,
            qq:{
              mid:song.mid
            }
          };
          pushed.title=song.singer+' - '+song.song;
          res.songs.push(pushed);
        });
        cb(res);
      })
      return a;
    },
    _netease_search: function (keyword, cb, details) {
      var url = 'https://api.gumengya.com/Api/Music?format=json&site=netease&text='+encodeURIComponent(keyword)+'&num='+(details.pagesize||30)+'&page='+(details.page||1);
      var a=musicapi._request(url, function (data) {
        var res = {
          total: Infinity,
          page: details.page||1,
          songs: [],
        }
        data.data.forEach(function (song) {
          var pushed={
            name: song.title,
            artist: song.author,
            netease:{
              id:song.songid
            }
          };
          pushed.title=song.author+' - '+song.title;
          res.songs.push(pushed);
        });
        cb(res);
      })
      return a;
    },
    parseLrc: function (lrc) {
      lrc=lrc||"[00:00.00] 暂无歌词";
      return lrc;
    },
    _compareDef: function (r, def) {
      if (!def) return r;
      for (var k in def) {
        r[k] = def[k];
      }
      return r;
    }
  }