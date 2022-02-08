import HttpsProxyAgent from "https-proxy-agent/dist/agent";
import * as url from "url";
import { BufferedProcess } from "atom";

export type ProxyAgentSettings = {
  agent: HttpsProxyAgent | undefined;
  rejectUnauthorized: boolean;
};
export default async function getHttpsProxyAgent(): Promise<ProxyAgentSettings> {
  const proxySettings = await getProxySettings();

  if (!proxySettings) {
    return { agent: undefined, rejectUnauthorized: false };
  }

  const proxyUrl = url.parse(proxySettings);
  if (proxyUrl.protocol !== "https:" && proxyUrl.protocol !== "http:") {
    return { agent: undefined, rejectUnauthorized: false };
  }

  const rejectUnauthorized = !!(await readApmConfig<boolean>("strict-ssl"));

  const parsedPort: number | undefined = proxyUrl.port
    ? parseInt(proxyUrl.port, 10)
    : undefined;
  const port = Number.isNaN(parsedPort) ? undefined : parsedPort;

  const proxyOptions = {
    host: proxyUrl.hostname,
    port,
    auth: proxyUrl.auth,
    rejectUnauthorized,
  };

  return {
    agent: new HttpsProxyAgent(proxyOptions),
    rejectUnauthorized,
  };
}

function readApmConfig<T = string>(key: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const process = new BufferedProcess({
      command: atom.packages.getApmPath(),
      args: ["config", "get", key],
      stdout: (data) => {
        const trimmed = data.trim();
        if (trimmed == "undefined" || trimmed == "null") {
          resolve(null);
        } else {
          resolve(JSON.parse(trimmed));
        }
      },
      stderr: () => {
        resolve(null);
      },
      exit: (code: number) => {
        if (code !== 0) {
          resolve(null);
        }
      },
      autoStart: true,
    });
    process.onWillThrowError((params) => {
      resolve(null);
      params.handle();
    });
  });
}

async function getProxySettings(): Promise<string | undefined> {
  const [httpsProxy, proxy] = await Promise.all([
    readApmConfig("https-proxy"),
    readApmConfig("proxy"),
  ]);

  return (
    httpsProxy ||
    proxy ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  );
}
