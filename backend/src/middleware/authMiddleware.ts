import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    ci: string;
    rol: string;
    rol_activo?: string; // Rol que el usuario está usando actualmente
    roles_disponibles?: string[]; // Todos los roles que el usuario puede usar
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        ci: string; 
        rol: string; 
        rol_activo?: string;
        roles_disponibles?: string[];
      };
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};






