import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('No token provided');

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
      req['user'] = decoded;
      next();
    } catch {
      return res.status(401).send('Invalid token');
    }
  }
}
