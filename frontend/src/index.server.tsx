import * as path from "path";
import * as fs from "fs";
import * as net from "net";

import * as express from "express"
import { Server}  from "http";

import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import { StaticRouter } from 'react-router-dom';
import { spawn } from "child_process";

import { App } from "./App";

const frontendServer = startFrontendServer();
startControlServer(frontendServer);

function startFrontendServer(): Server {
  const app = express();

  let { templateStart, templateEnd } = loadTemplate();
  
  const serverRenderer = (req, res, next) => {
    const context = { statusCode: 200 };
    const rendered = ReactDOMServer.renderToString(
      <StaticRouter location={req.originalUrl} context={context}>
          <App />
      </StaticRouter>
    );
  
    res.status(context.statusCode);
    return res.send(
      templateStart + rendered + templateEnd 
    );
  }
  
  app.use(
    "/static",
    express.static(path.resolve(".", "dist-client", "static"), { maxAge: '30d' })
  );
  
  app.use(/^.*/i, serverRenderer);
  
  try { fs.unlinkSync("/tmp/ssr-server.sock"); }
  catch {}
  
  return app.listen("/tmp/ssr-server.sock", () => {
    console.log(`SSR running on '/tmp/ssr-server.sock'`)
  });
}

function loadTemplate() {
  const template = fs.readFileSync("./index.html");
  const rootEnd = template.indexOf('</div>');
  const templateStart = template.toString("utf8", 0, rootEnd);
  const templateEnd = template.toString("utf8", rootEnd);

  return {
    templateStart,
    templateEnd
  };
}

function startControlServer(frontendServer: Server) {
  const server = net.createServer(function(client: net.Socket) {
    client.setEncoding("utf8");
    client.on("data", function(data: Buffer) {
      const command = data.toString().trim();

      console.log("Received control command: [" + command + "]");

      if (command === "stop") {
        server.close();
        frontendServer.close();
      }
      else if (command === "restart") {
        startSelfOnExit();

        server.close();
        frontendServer.close();
      }
    });
  });

  try { fs.unlinkSync("/tmp/ssr-server-control.sock"); }
  catch {}

  server.listen("/tmp/ssr-server-control.sock");
}

function startSelfOnExit() {
  process.on("exit", function() {
    spawn(process.execPath, [__filename], {
      detached: true
    }).unref();
  });
}