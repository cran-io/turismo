# Turismo

##API

###POST /visitor/signup

Invocado por los totem para el registro de una persona

#### Params:
- **name**: String,
- **email**: String,
- **qrCode**: String,
- **preferenceZone**: Integer [0-6]

#### Returns:
- **HTTP 200**, si no hubo error.
- **HTTP 500**, si hay error, con un Array con los mensajes de error.

### POST /visitor/checkin
Invocado desde los lectores QR cuando éste lee un nuevo código.

#### Params:
- **qrReaderId**: Integer (Código que identifica unívocamente el lector QR, preferiblemente el IP)
- **qrCode**: String

#### Returns:
- **HTTP 200**, si no hubo error.
- **HTTP 500**, si hay error.

### POST /tour/begin
Invocado en el momento que las personas recién registradas ingresan al recinto.

#### No params.

#### Returns:
- **HTTP 200**, si no hubo error, con el id del grupo creado.
- **HTTP 500**, si hay error.

### POST /tour/end
Invocado en el momento que las personas salen del domo.

#### No params

#### Returns:
- **HTTP 200**, si no hubo error.
- **HTTP 500**, si hay error.

### POST /image/upload
Invocado para subir las fotos tomadas por las tablets.

#### Params: (MultiPart)
- **picture**, la foto a subir. Va a ser renombrada a filename_date.ext

#### Returns:
- **HTTP 200**, si no hubo error.
- **HTTP 500**, si hay error.

### POST /dome/upload
Invocado para subir las fotos tomadas por las tablets.

#### Params: (MultiPart)
- **dome_image**, la foto del domo a subir. Mantiene su nombre original.

#### Returns:
- **HTTP 200**, si no hubo error.
- **HTTP 500**, si hay error.

## Statistics

```
db.visitors.aggregate([{"$group": {_id: {y: {"$year":"$createdAt"}, m: {"$month":"$createdAt"}, d: {"$dayOfMonth":"$createdAt"}}, count: {$sum:1}}}, { $sort: {_id: 1}}]);
```
