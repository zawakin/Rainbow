$(function(){
  var PI = Math.PI;
  var sqrt = Math.sqrt;
  var sin = Math.sin;
  var cos = Math.cos;
  var tan = Math.tan;
  var abs = Math.abs;
  var atan2 = Math.atan2;
  var asin = Math.asin;

  var mod = function(a,b){
    return a - b * Math.floor(a/b);
  }

  var radToDeg = function(rad){
    return rad / PI * 180;
  }
  var degToRad = function(deg){
    return deg / 180 * PI;
  }

  class Point{
    constructor(x,y){
      this.x = x;
      this.y = y;
    }
    dist(p){
      var dx = p.x - this.x;
      var dy = p.y - this.y;
      return sqrt(dx*dx + dy*dy);
    }
    add(p){
      return new Point(this.x+p.x,this.y+p.y);
    }
    multiply(s){
      return new Point(this.x*s,this.y*s);
    }
    sub(p){
      return this.add(p.multiply(-1));
    }
    div(s){
      return this.multiply(1.0/s);
    }
    ang(){
      return mod(atan2(this.y,this.x),2*PI);
    }
    norm(){
      return sqrt(this.x*this.x+this.y*this.y);
    }
    normedVector(){
      // return
      return this.div(this.norm());
    }
    static createFromPolar(r,theta){
      return new Point(r*cos(theta),r*sin(theta));
    }

  }
  class Ball{
    constructor(centerX,centerY,size){
      this.center = new Point(centerX,centerY);
      this.size = size;
    }
    draw(ctx){
      ctx.beginPath();
      ctx.arc(this.center.x,this.center.y,this.size,0,2*PI);
      ctx.stroke();
    }
  }

  class Line{
    constructor(p0,p1){
      this.p0 = p0;
      this.p1 = p1;
    }

    setPoints(p0,p1){
      this.p0 = p0;
      this.p1 = p1;
    }

    draw(ctx){
      ctx.beginPath();
      ctx.moveTo(this.p0.x,this.p0.y);
      ctx.lineTo(this.p1.x,this.p1.y);
      ctx.stroke();
    }
  }

  class Ray{
    constructor(n,color){
      this.n = n;
      this.color = color;
      this.p0 = new Point(0,0);
      this.p1 = new Point(0,0);
      this.p2 = new Point(0,0);
      this.p3 = new Point(0,0);
      this.pf = new Point(0,0);

      this.b = new Ball(400,400,200);
      this.b1 = new Ball(this.p1.x,this.p1.y,2);
      this.b2 = new Ball(this.p2.x,this.p2.y,2);
      this.b3 = new Ball(this.p3.x,this.p3.y,2);

      this.line0_1 = new Line(this.p0,this.p1);
      this.line1_2 = new Line(this.p1,this.p2);
      this.line2_3 = new Line(this.p2,this.p3);
      this.line3_f = new Line(this.p3,this.pf);

      this.allObjects = [];

      this.allObjects.push(this.b1);
      this.allObjects.push(this.b2);
      this.allObjects.push(this.b3);
      this.allObjects.push(this.line0_1);
      this.allObjects.push(this.line1_2);
      this.allObjects.push(this.line2_3);
      this.allObjects.push(this.line3_f);
    }

    update(mouse){
      this.p1 = mouse.sub(b.center).normedVector().multiply(b.size).add(b.center);
      this.p0 = new Point(0,this.p1.y);
      this.b1.center = this.p1;
      var inAng = incidentAngle(this.p1,b.center);
      // console.log(p1);
      var refAng = refractionAngle(inAng,this.n);
      var ang2 = inAng + (PI - 2 * refAng);
      var rel2 = Point.createFromPolar(b.size,ang2);
      this.b2.center = rel2.add(b.center);

      var ang3 = ang2 + (PI - 2 * refAng);
      var rel3 = Point.createFromPolar(b.size,ang3);
      this.b3.center = rel3.add(b.center);

      var outAng = ang3 + inAng - PI;
      this.pf = this.b3.center.add(Point.createFromPolar(1000,outAng));

      this.line0_1.setPoints(this.p0,this.p1);
      this.line1_2.setPoints(this.p1,this.b2.center);
      this.line2_3.setPoints(this.b2.center,this.b3.center);
      this.line3_f.setPoints(this.b3.center,this.pf);
    }

    draw(ctx){
      // if(color != null){
      //
      // }
      ctx.strokeStyle = this.color;
      for(let obj of this.allObjects){
        obj.draw(ctx);
      }
      ctx.strokeStyle = "black";
    }

  }


  var mouse;
  var w = 1000;
  var h = 1000;
  var cnvs = $("#cnvs")[0];
  var ctx = cnvs.getContext("2d");

  ctx.globalAlpha = 0.01;

  var allObjects = [];

  var b = new Ball(400,400,200);
  allObjects.push(b);

  var rays = [];
  rays.push(new Ray(1.34451,"#d400ff"));
  rays.push(new Ray(1.34235,"#5000ff"));
  rays.push(new Ray(1.34055,"#0033ff"));
  rays.push(new Ray(1.33903,"#00b3ff"));
  rays.push(new Ray(1.33772,"#00ff80"));
  rays.push(new Ray(1.33659,"#37ff00"));
  rays.push(new Ray(1.33560,"#92ff00"));
  rays.push(new Ray(1.33472,"#edff00"));
  rays.push(new Ray(1.33393,"#ffb100"));
  rays.push(new Ray(1.33322,"#ff4e00"));
  rays.push(new Ray(1.33257,"#ff0000"));
  rays.push(new Ray(1.33197,"#ff0000"));
  rays.push(new Ray(1.33141,"#ff0000"));
  // rays.push(new Ray(1.5));
  // rays.push(new Ray(0.5));
  for(let ray of rays){
    allObjects.push(ray);
  }

  function allDraw(ctx){
    // ctx.clearRect(0,0,w,h);
    for(let obj of allObjects){
      obj.draw(ctx);
    }
  }

  function incidentAngle(p1,center){
    var d = p1.sub(center);
    return d.ang();
  }

  function refractionAngle(inAng,n){
    return asin(sin(inAng-PI)/n);
  }

  var counter = 0;
  $("#cnvs").mousemove(e=>{
    counter++;
    if(counter%3!=0) return;
    mouse = new Point(e.pageX,e.pageY);
    if(mouse.x < b.center.x);

    for(let ray of rays){
      ray.update(mouse);
    }
    allDraw(ctx);
  });



});
