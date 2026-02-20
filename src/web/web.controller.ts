import { Controller, Get, Query } from '@nestjs/common';
import { ShareService } from '../share/share.service';

@Controller()
export class WebController {
  constructor(private readonly shareService: ShareService) {}

  // 기사 페이지
  @Get('/driver')
  driverPage() {
    return `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>기사 운행 시작</title>
      <style>
        body{background:#000;color:#fff;text-align:center;padding-top:120px;font-family:sans-serif}
        button{font-size:28px;padding:20px 40px;border-radius:14px;border:0;background:#22c55e;color:#fff}
      </style>
    </head>
    <body>
      <h1>기사 운행 시작</h1>
      <button onclick="start()">운행 시작</button>

      <script>
        async function start(){
          await fetch('/driver/start',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({routeId:1})
          })
          alert('운행 시작됨')
        }
      </script>
    </body>
    </html>
    `;
  }

  // 학부모 지도 페이지
  @Get('/p/:token')
  async parentMap(@Query('token') token: string) {
    return `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>실시간 버스 위치</title>
      <style>
        body{background:#000;color:#fff;text-align:center;padding-top:120px;font-family:sans-serif}
      </style>
    </head>
    <body>
      <h1>실시간 버스 위치</h1>
      <div id="info">불러오는중...</div>

      <script>
        const token = location.pathname.split('/').pop();

        async function load(){
          const res = await fetch('/share/'+token);
          const data = await res.json();
          document.getElementById('info').innerHTML =
            '다음정류장: ' + (data.nextStop?.name || '-') +
            '<br>ETA: ' + (data.etaMin ?? '-') + '분';
        }

        load();
        setInterval(load,3000);
      </script>
    </body>
    </html>
    `;
  }
}
