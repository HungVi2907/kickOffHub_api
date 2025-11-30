import { Router } from 'express';

export default function buildHttpRouter(modules = []) {
  const router = Router();

  modules
    .filter(Boolean)
    .forEach((manifest) => {
      const mountPath = manifest.basePath || '/';
      const hasScopedRoutes = manifest.publicRoutes || manifest.privateRoutes;

      if (hasScopedRoutes) {
        if (manifest.publicRoutes) {
          router.use(mountPath, manifest.publicRoutes);
        }

        if (manifest.privateRoutes) {
          router.use(mountPath, manifest.privateRoutes);
        }
        return;
      }

      if (manifest.routes) {
        router.use(mountPath, manifest.routes);
      }
    });

  return router;
}
