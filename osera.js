//--------------------------------------------------------
// オセロ棋譜再生スクリプト「オセラ」 ver.20140221-3
//--------------------------------------------------------
var seq = new Array(61); //着手順序データ
var n_black = new Array(61);	//黒石の数
var n_white = new Array(61);	//白石の数
var tbl = new Array(64*61); //盤面データ
var dat = new Array(7);	//盤面画像
var n = 0;	//現在何手目か
var kifstr; //棋譜文字列
var kiflen=0;	//棋譜の長さ（何手まであるか）
var col = 1;	//現在の手番（1:黒、2:白）
var start=0;	//何手目から再生開始するか
var startBoard = "---------------------------OX------XO---------------------------";

String.prototype.trimAll = function() {
	return this.replace(/[ \s\n\r\t]+/g, '');
}

//------------------------
// １方向分の石を返す
//------------------------
function turn_disk( d, xs )
{
	cnt1 = 0;
	i = seq[n];
	x = seq[n] % 8;
	while( (0<=(x+xs))&&((x+xs)<=7)&&(0<=(i+d))&&((i+d)<=63) ){
		if( 0 == tbl[64*n+i+d] ){
			break;
		} else if( col == tbl[64*n+i+d] ){
			while( i != seq[n] ){
				tbl[64*n+i] = col;
				i -= d;
				cnt1++;
			}
			break;
		} else{
			i += d;
			x += xs;
		}
	}
	return( cnt1 );
}

//----------------
// 盤面更新
//----------------
function renw_tbl()
{
	try{
		cnt	= 0; //返した石の数
		pass = 0; //パス回数（２になったら棋譜NG）
		for( i=0; i<64; i++ ){
			tbl[64*n+i] = tbl[64*(n-1)+i];
		}
		if( 0 == tbl[64*n+seq[n]] ){
			//石を返す
			tbl[64*n+seq[n]] = col;
			cnt += turn_disk( -9, -1 );
			cnt += turn_disk( -8,  0 );
			cnt += turn_disk( -7,  1 );
			cnt += turn_disk( -1, -1 );
			cnt += turn_disk(  1,  1 );
			cnt += turn_disk(  7, -1 );
			cnt += turn_disk(  8,  0 );
			cnt += turn_disk(  9,  1 );
			col = 3 - col; //手番更新
		}
		else{
			throw "kifu NG:already exist stone";
		}
		if( 0 == cnt ){
			pass++;
			if( 1 == pass ){
				renw_tbl();
			}
			else{
				throw "kifu NG:cannot turn stone";
			}
		}
		n_black[n] = n_white[n] = 0;
		for( i=0; i<64; i++ ){
			if( 1 == tbl[64*n+i] ){
				n_black[n]++;
			}
			else if( 2 == tbl[64*n+i] ){
				n_white[n]++;
			}
		}
	}
	catch(e){
		alert(e);
	}
}

//---------------
// 盤面出力
//---------------
function disp_tbl()
{
	for( i=0; i<64; i++ ){
		document.getElementById( 'oth_'+i ).innerHTML = dat[tbl[64*n+i]];
	}
	if( n>0 ){
		if( n<10 ){
			document.getElementById( 'oth_'+seq[n] ).innerHTML = dat[tbl[64*n+seq[n]]+2];	//今打った石
		}
		else{
			document.getElementById( 'oth_'+seq[n] ).innerHTML = dat[tbl[64*n+seq[n]]+4];	//今打った石
		}
		document.getElementById( 'oth_n_now' ).textContent = n;
	}
	document.getElementById( 'oth_n_black' ).textContent = n_black[n];	//黒石の数
	document.getElementById( 'oth_n_white' ).textContent = n_white[n];	//白石の数
}

//---------------
// 棋譜出力
//---------------
function disp_kifu()
{
	var win=window.open("","win","top=0,left=0,width=400,height=100");
	win.document.open();
	win.document.write( '<html><head></head><body><textarea name="kifu" cols="60" rows="4" readonly>'+kifstr+'</textarea></body></html>' );
	win.document.close();
	win.focus();
}

//----------------
// １手進む
//----------------
function i_next()
{
	if( n<kiflen ){ n++; }
	disp_tbl();
}

//----------------
// １手戻す
//----------------
function i_previous()
{
	if( 0<n ){ n--; }
	disp_tbl();
}

//----------------
// 初期状態に戻す
//----------------
function i_top()
{
	n = 0;
	disp_tbl();
}

//----------------
// 最後へ
//----------------
function i_end()
{
	n = kiflen;
	disp_tbl();
}


function init()
{
	// 最初の1文字 (?記号) を除いた文字列を取得する
	var query = window.location.search.substring( 1 );
	// クエリの区切り記号 (&) で文字列を配列に分割する
	var parameters = query.split( '&' );
	var inpara = new Object();
	for( var i = 0; i < parameters.length; i++ )
	{
		// パラメータ名とパラメータ値に分割する
		var element = parameters[ i ].split( '=' );
		var paramName = decodeURIComponent( element[ 0 ] );
		var paramValue = decodeURIComponent( element[ 1 ] );
		// パラメータ名をキーとして連想配列に追加する
		inpara[ paramName ] = paramValue;
	}
	
	if( inpara.kifu ){
		kifstr = inpara.kifu.trimAll();	// kifu=f5d6cd3･･･ の f5d6cd3･･･ が入る
	}

	if ( inpara.start ) {
    	start = parseInt( inpara.start );	// start=?? の数値が入る
	}

	if ( inpara.start_board ){	// start_board= の後の文字列が入る
		try{
			if (64 == inpara.start_board.trimAll().length) {
				startBoard = inpara.start_board.trimAll();
			}
			else if (65 == inpara.start_board.trimAll().length) {
				startBoard = inpara.start_board.trimAll().substr(0,64);
				switch (inpara.start_board.trimAll().charAt(64)) {
				case "*":
				case "x":
				case "X":
					col = 1;
			 		break;
				case "o":
				case "O":
					col = 2;
					break;
				default:
					throw "start_board parameter Error(start_color is X or O)";
					break;
				}
			}
			else {
				throw "startt_board parameter Error(length)";
			}
		}
		catch(e)	{
			alert(e);
		}
	}

	//盤面画像指定
	dat[0] = '<img src="space.png" width=27 height=27>'; //空き
	dat[1] = '<img src="black.png" width=27 height=27>'; //黒石
	dat[2] = '<img src="white.png" width=27 height=27>'; //白石
	dat[3] = '<div style="position:relative;"><img src="black.png" width=27 height=27><div style="position:absolute; top:2px; left:9px; color:#ffffff; font-size:15px; font-family: "ＭＳ ゴシック",sans-serif;" id="oth_n_now"></div></div>'; //今置いた黒石、数字1桁
	dat[4] = '<div style="position:relative;"><img src="white.png" width=27 height=27><div style="position:absolute; top:2px; left:9px; color:#000000; font-size:15px; font-family: "ＭＳ ゴシック",sans-serif;" id="oth_n_now"></div></div>'; //今置いた白石、数字1桁
	dat[5] = '<div style="position:relative;"><img src="black.png" width=27 height=27><div style="position:absolute; top:2px; left:4px; color:#ffffff; font-size:15px; font-family: "ＭＳ ゴシック",sans-serif;" id="oth_n_now"></div></div>'; //今置いた黒石、数字2桁
	dat[6] = '<div style="position:relative;"><img src="white.png" width=27 height=27><div style="position:absolute; top:2px; left:4px; color:#000000; font-size:15px; font-family: "ＭＳ ゴシック",sans-serif;" id="oth_n_now"></div></div>'; //今置いた白石、数字2桁

	//着手順序データ，盤面データ設定
	var strAtoH = 'abcdefgh';
	kifstr = kifstr.toLowerCase();
	for(i=0; i<61; i++){
		seq[i] = 0;
	}
	kiflen = kifstr.length / 2;
	if(kiflen > 64){	//棋譜文字列がとても長い場合の予防策
		kiflen = 60;
	}
	for(i=0; i<kiflen; i++){
		j = i+i;
		xstr = kifstr.substr(j, 1);
		x = strAtoH.indexOf( xstr );
		ystr = kifstr.substr(j+1, 1);
		y = parseInt( ystr )-1;
		seq[i+1] = y*8+x;
	}
	n_black[0] = n_white[0] = 0;	//初期盤面の石数
	for(i=0; i<64; i++){
		switch (startBoard.charAt(i)) {
		case "*":
		case "x":
		case "X":
			tbl[i] = 1;
			n_black[0]++;
	 		break;
		case "o":
		case "O":
			tbl[i] = 2;
			n_white[0]++;
			break;
		default:
			tbl[i] = 0;
			break;
		}
	}
	for( n=1; n<=kiflen; n++ ){
		renw_tbl();
	}
}

//----------------
// 読み込み時処理
//----------------
function onload()
{
	init();	//初期化
	n = start;
	disp_tbl();
}
