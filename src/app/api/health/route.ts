import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Health Check Endpoint
 * 
 * Returns application health status including:
 * - Application uptime
 * - Database connectivity
 * - System resources
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();
    
    // Check system resources
    const systemHealth = getSystemHealth();
    
    const responseTime = Date.now() - startTime;

    if (dbHealthy) {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime,
        checks: {
          database: 'healthy',
          system: systemHealth,
        },
        version: process.env.npm_package_version || '1.0.0',
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime,
        checks: {
          database: 'unhealthy',
          system: systemHealth,
        },
        version: process.env.npm_package_version || '1.0.0',
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.npm_package_version || '1.0.0',
    }, { status: 503 });
  }
}

/**
 * Check database connectivity
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check database connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get system health metrics
 */
function getSystemHealth() {
  const memoryUsage = process.memoryUsage();
  
  return {
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    cpu: {
      user: process.cpuUsage().user,
      system: process.cpuUsage().system,
    },
    uptime: Math.round(process.uptime()), // seconds
  };
}
