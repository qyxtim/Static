function ImgInfo(params){
	this.pageW=params.pageW;
	this.pageH=params.pageH;
	this.pageScale=this.pageH/this.pageW;
}
ImgInfo.prototype={
	constructor:ImgInfo,
	reset:function(el){ 
		this.img=el;
		var boundClient=this.img.getBoundingClientRect();
		this.scale=boundClient.height/boundClient.width;
		this.ifFullByHeight=this.scale>this.pageScale;
		this.ifFullByHeight ? this.setHeight(this.pageH) : this.setWidth(this.pageW);	
		this.startAnitScale=0.2;
	},
	setWidth:function(w){
		this.w=w;
		this.h=this.w*this.scale;
		this.x=(this.pageW-this.w)/2;
		this.y=(this.pageH-this.h)/2;
	},
	setHeight:function(w){
		this.h=this.pageH;
		this.w=this.h/this.scale;
		this.y=0;
		this.x=(this.pageW-this.w)/2;
	},
	endScale:function(){
		if(this.w>this.pageW||this.h>this.pageH){
			return;
		}
		this.ifFullByHeight ? this.setHeight(this.pageH) : this.setWidth(this.pageW);
	},
	moveX:function(distX){
		if(this.x>0 || (this.x+this.w)<this.pageW){
			this.x+=distX/5;
		}
		else{
			this.x+=distX;
		}
	},
	moveY:function(distY){
		if(this.h<=this.pageH){
			return;
		}
		if((this.h>this.pageH && this.y>0) || (this.h>this.pageH && (this.y+this.h)<this.pageH)){
			this.y+=distY/5;
		}
		else{
			this.y+=distY;
		}
	},
	move:function(distX,distY){
		this.moveX(distX);
		this.moveY(distY);
	},
	endMove:function(){
		if(this.x>0){
			this.x=this.ifFullByHeight&&this.w<this.pageW ? (this.pageW-this.w)/2 : 0;
		}
		else if((this.x+this.w)<this.pageW){
			this.x=this.ifFullByHeight&&this.w<this.pageW ? (this.pageW-this.w)/2 :  (this.pageW-this.w);
		}
		if(this.h>this.pageH && this.y>0){
			this.y=0;
		}
		else if(this.h>this.pageH && (this.y+this.h)<this.pageH){
			this.y=this.pageH-this.h;
		}
	},
	startAnit:function(ctx){
		var _this=this;
		this.startAnitScale+=0.05;
		this.startAnitDraw(ctx);
		if(this.startAnitScale>=1){
			this.startAnitScale=1;
			this.startAnitDraw(ctx);
			this.startAnitScale=0.2;
			return;
		}
		requestAnimationFrame(function(){
			_this.startAnit(ctx);
		})
	},
	startAnitDraw:function(ctx){
		ctx.clearRect(0,0,this.pageW,this.pageH);
		ctx.save();
		var w=this.w*this.startAnitScale;
		var h=this.h*this.startAnitScale;
		ctx.translate((this.pageW-w)/2,(this.pageH-h)/2);
		ctx.beginPath();
		ctx.drawImage(this.img,0,0,w,h);
		ctx.closePath();
		ctx.restore();
	},
	draw:function(ctx){
		ctx.clearRect(0,0,this.pageW,this.pageH);
		ctx.save();
		ctx.beginPath();
		ctx.drawImage(this.img,this.x,this.y,this.w,this.h);
		ctx.closePath();
		ctx.restore();
	}
}

function WxScale(params){
	this.moveData={
		ifStart:false,
		startX:1,
		startY:1,
	};
	this.scaleData={
		ifStart:false,
		startDist:1,
	};
	this.init(params);
	this.bindEvent();
}
WxScale.prototype={
	constructor:WxScale,
	init:function(params){
		this.fullPage=params.fullPage;
		this.canvas=params.canvas;
		this.fullPage.style.display="block";
		var clientRect=this.canvas.getBoundingClientRect();
		this.w=this.canvas.width=clientRect.width;
		this.h=this.canvas.height=clientRect.height;
		this.ctx=canvas.getContext("2d");
		this.img=new ImgInfo({
			pageW:this.w,
			pageH:this.h
		});
		this.fullPage.style.display="none"; 
	},
	start:function(el){
		this.fullPage.style.display="block";
		this.img.reset(el);
		this.img.startAnit(this.ctx);
	},
	bindEvent:function(){
		var _this=this;
		this.fullPage.addEventListener("touchstart",function(e){
			_this.touchstart(e);
		},false)
		this.fullPage.addEventListener("touchmove",function(e){
			_this.touchmove(e);
		},false)
		this.fullPage.addEventListener("touchend",function(e){
			_this.touchend(e);
		},false)
		this.fullPage.addEventListener("click",function(){
			this.style.display="none";
		},false)
	},
	touchstart:function(e){
		if(e.touches.length==1){
			this.moveData.ifStart=true;
			this.moveData.startX=e.touches[0].pageX;
			this.moveData.startY=e.touches[0].pageY;
		}
		else if(e.touches.length>=2){
			this.scaleData.ifStart=true;
			this.scaleData.startDist=this.getDistance(e.touches[0],e.touches[1]);
			this.imgBaseWidth=this.img.w;
		}
	},
	touchmove:function(e){
		e.preventDefault();
		if(this.moveData.ifStart&&e.touches.length==1){
			var distX=e.touches[0].pageX-this.moveData.startX;
			var distY=e.touches[0].pageY-this.moveData.startY;
			this.moveData.startX=e.touches[0].pageX;
			this.moveData.startY=e.touches[0].pageY;
			this.img.move(distX,distY);
		}
		else if(this.scaleData.ifStart&&e.touches.length>=2){
            var moveDist=this.getDistance(e.touches[0],e.touches[1]);
            var scale=(moveDist/this.scaleData.startDist).toFixed(2);
            this.img.setWidth(this.imgBaseWidth*scale);
		}
		this.img.draw(this.ctx);
	},
	touchend:function(e){
		if(this.scaleData.ifStart){
			this.scaleData.ifStart=false;
			this.moveData.ifStart=false;
			this.img.endScale();
			this.img.draw(this.ctx);
		}
		else if(this.moveData.ifStart){
			this.moveData.ifStart=false;
			this.img.endMove();
			this.img.draw(this.ctx);
		}
		
	},
	getDistance:function(p1, p2){
		var x=p2.pageX-p1.pageX,
	        y=p2.pageY-p1.pageY;
	    return Math.sqrt(x*x+y*y);
	}
}





