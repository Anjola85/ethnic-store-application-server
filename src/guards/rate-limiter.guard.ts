import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Injectable()
export class RateLimiterGuard extends ThrottlerGuard {
  // this is to implement a dynamic rate limiter for specific endpoint
}
