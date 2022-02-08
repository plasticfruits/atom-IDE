import * as https from "https";
import { ClientRequest, IncomingMessage } from "http";
import * as fs from "fs";
import * as url from "url";
import { ProxyAgentSettings } from "./proxyProvider";

export async function downloadFileToStr(urlStr: string, proxy: ProxyAgentSettings): Promise<string> {
  return downloadResource(
    urlStr,
    (response, resolve, reject) => {
      let downloadedData = "";
      response.on("data", (data) => {
        downloadedData += data;
      });
      response.on("error", (error) => {
        reject(error);
      });
      response.on("end", () => {
        resolve(downloadedData);
      });
    },
    proxy
  );
}
export function downloadFileToDestination(
  urlStr: string,
  destinationPath: string,
  proxy: ProxyAgentSettings
): Promise<void> {
  return downloadResource(
    urlStr,
    (response, resolve, reject) => {
      const createdFile: fs.WriteStream = fs.createWriteStream(destinationPath);
      createdFile.on("finish", () => {
        resolve();
      });
      response.on("error", (error) => {
        reject(error);
      });
      response.pipe(createdFile);
    },
    proxy
  );
}

export function downloadResource<T>(
  urlStr: string,
  callback: (
    response: IncomingMessage,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (error: Error) => void
  ) => void,
  proxy: ProxyAgentSettings
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const parsedUrl = url.parse(urlStr);
    const { agent, rejectUnauthorized } = proxy;
    const request: ClientRequest = https.request(
      {
        host: parsedUrl.host,
        path: parsedUrl.path,
        port: getPortNumber(parsedUrl),
        agent,
        rejectUnauthorized,
        headers: { "User-Agent": "TabNine.tabnine-vscode" },
      },
      (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          let redirectUrl: string;
          if (typeof response.headers.location === "string") {
            redirectUrl = response.headers.location;
          } else {
            if (!response.headers.location || response.headers.location) {
              return reject(new Error("Invalid download location received"));
            }
            [redirectUrl] = response.headers.location as string[];
          }
          return resolve(downloadResource(redirectUrl, callback, proxy));
        }
        if (response.statusCode !== 200 && response.statusCode !== 403) {
          return reject(
            new Error(`Failed request statusCode ${response.statusCode || ""}`)
          );
        }
        callback(response, resolve, reject);
        response.on("error", (error) => {
          reject(error);
        });
        return undefined;
      }
    );
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });
}
function getPortNumber(
  parsedUrl: url.UrlWithStringQuery
): string | number | undefined {
  return (
    (parsedUrl.port && Number(parsedUrl.port)) ||
    (parsedUrl.protocol === "https:" ? 443 : 80)
  );
}
