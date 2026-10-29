import { IncidenteInstitucional, ZonaCalor } from '../types/institution-reports.types.js';

const EARTH_RADIUS_METERS = 6_371_000;
const ANALYSIS_WINDOW_MS = 24 * 60 * 60 * 1000;
const CLUSTER_RADIUS_METERS = 300;
const MIN_REPORTS_PER_ZONE = 3;
const MAX_ZONE_RADIUS_METERS = 450;
const EDGE_BUFFER_METERS = 50;

function distanceMeters(
  a: { latitud: number; longitud: number },
  b: { latitud: number; longitud: number }
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const lat1 = toRadians(a.latitud);
  const lat2 = toRadians(b.latitud);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(b.longitud - a.longitud);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

function findClusters(points: IncidenteInstitucional[]): IncidenteInstitucional[][] {
  const labels = new Array<number>(points.length).fill(0);
  const clusters: IncidenteInstitucional[][] = [];
  let nextClusterId = 0;

  const neighborsOf = (pointIndex: number) =>
    points.reduce<number[]>((neighbors, candidate, candidateIndex) => {
      if (
        distanceMeters(points[pointIndex].coordenadas, candidate.coordenadas) <=
        CLUSTER_RADIUS_METERS
      ) {
        neighbors.push(candidateIndex);
      }
      return neighbors;
    }, []);

  points.forEach((_point, pointIndex) => {
    if (labels[pointIndex] !== 0) return;

    const neighbors = neighborsOf(pointIndex);
    if (neighbors.length < MIN_REPORTS_PER_ZONE) {
      labels[pointIndex] = -1;
      return;
    }

    nextClusterId += 1;
    labels[pointIndex] = nextClusterId;
    const queue = [...neighbors];

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const neighborIndex = queue[cursor];

      if (labels[neighborIndex] === -1) labels[neighborIndex] = nextClusterId;
      if (labels[neighborIndex] !== 0) continue;

      labels[neighborIndex] = nextClusterId;
      const neighborNeighbors = neighborsOf(neighborIndex);
      if (neighborNeighbors.length >= MIN_REPORTS_PER_ZONE) {
        neighborNeighbors.forEach((candidateIndex) => {
          if (!queue.includes(candidateIndex)) queue.push(candidateIndex);
        });
      }
    }

    clusters.push(points.filter((_candidate, index) => labels[index] === nextClusterId));
  });

  return clusters;
}

/** Builds small, data-driven hotspot zones; isolated incidents remain point markers. */
export function buildHeatZones(
  incidents: IncidenteInstitucional[],
  now = Date.now()
): ZonaCalor[] {
  const recentIncidents = incidents.filter((incident) => {
    const reportedAt = new Date(incident.fechaReporte).getTime();
    return (
      Number.isFinite(reportedAt) &&
      now - reportedAt >= 0 &&
      now - reportedAt <= ANALYSIS_WINDOW_MS &&
      incident.estado !== 'FALSA_ALARMA' &&
      Number.isFinite(incident.coordenadas.latitud) &&
      Number.isFinite(incident.coordenadas.longitud)
    );
  });

  return findClusters(recentIncidents).flatMap((cluster) => {
    const centro = cluster.reduce(
      (sum, incident) => ({
        latitud: sum.latitud + incident.coordenadas.latitud / cluster.length,
        longitud: sum.longitud + incident.coordenadas.longitud / cluster.length,
      }),
      { latitud: 0, longitud: 0 }
    );
    const maxDistancia = Math.max(
      ...cluster.map((incident) => distanceMeters(centro, incident.coordenadas))
    );

    // DBSCAN can chain adjacent points; reject a cluster whose footprint is too broad.
    if (maxDistancia > MAX_ZONE_RADIUS_METERS - EDGE_BUFFER_METERS) return [];

    return [{
      ...centro,
      radioMetros: Math.max(90, Math.ceil(maxDistancia + EDGE_BUFFER_METERS)),
      cantidadReportes: cluster.length,
      intensidad: cluster.length >= 5 ? 'ALTA' as const : 'MEDIA' as const,
    }];
  });
}
