import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get app() {
    const port = this.configService.get<number>("PORT", 5002);
    const publicApiUrl = this.configService.get<string>(
      "PUBLIC_API_BASE_URL",
      `http://localhost:${port}`
    );
    return {
      port,
      publicApiUrl,
      publicFrontendUrl: this.configService.get<string>(
        "PUBLIC_FRONTEND_URL",
        "http://localhost:5274"
      ),
    };
  }

  get mongodb() {
    return {
      uri: this.configService.get<string>(
        "MONGODB_URI",
        "mongodb://localhost:27018/platform"
      ),
    };
  }

  get redis() {
    return {
      host: this.configService.get<string>("REDIS_HOST", "localhost"),
      port: parseInt(this.configService.get<string>("REDIS_PORT", "6378"), 10),
      password: this.configService.get<string>("REDIS_PASSWORD", ""),
      db: parseInt(this.configService.get<string>("REDIS_DB", "0"), 10),
    };
  }
}
