import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabases, disconnectDatabases } from './config/db.js';

async function bootstrap() {
    await connectDatabases();

    const server = app.listen(config.port, () => {
        console.log(`🚀 Servidor activo en: http://localhost:${config.port}`);
    });

    let isShuttingDown = false;

    const handleShutdown = async (signal) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        console.log(`\n⚠️  ${signal} recibido. Cerrando conexiones limpiamente...`);

        try {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
            await disconnectDatabases();
            console.log('✅ Servidor cerrado correctamente.');
        } catch (error) {
            console.error('❌ Error al cerrar el servidor:', error);
            process.exitCode = 1;
        }
    };

    process.once('SIGINT', () => handleShutdown('SIGINT'));
    process.once('SIGTERM', () => handleShutdown('SIGTERM'));

    if (process.platform === 'win32') {
        process.once('SIGBREAK', () => handleShutdown('SIGBREAK'));
    }
}

bootstrap();