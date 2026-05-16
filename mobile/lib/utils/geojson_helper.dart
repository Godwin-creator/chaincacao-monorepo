import 'package:latlong2/latlong.dart';

class GeoJsonHelper {
  static Map<String, dynamic> pointsToPolygon(List<LatLng> points) {
    if (points.isEmpty) return {};

    // Ensure polygon is closed
    final coordinates = points.map((p) => [p.longitude, p.latitude]).toList();
    if (points.first != points.last) {
      coordinates.add([points.first.longitude, points.first.latitude]);
    }

    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [coordinates],
      },
      'properties': {},
    };
  }

  static bool isValidPolygon(List<LatLng> points) {
    // Basic validation: at least 3 points (4 including closure)
    return points.length >= 3;
  }
}
