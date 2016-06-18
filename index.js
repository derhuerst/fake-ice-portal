'use strict'

const http = require('http')
const cfg = require('./package.json').config



const track = require('./track')
	.map((station) => ({
		  latitude:  station[0]
		, longitude: station[1]
		, when:      Date.now() + station[2] * 1000
	}))



const noise = (pos) => ({ // variance of ~100m
	  latitude:  Math.random() * 0.005 + pos.latitude
	, longitude: Math.random() * 0.005 + pos.longitude
})

const data = () => {
	const now = Date.now()
	if (now <= track[0].when) return null

	const next = track.findIndex((station) => now <= station.when)
	const last = next - 1
	const fraction = (now - track[last].when) / (track[next].when - track[last].when)

	// cheap approximation, proper GPS-based calculation would be nice here
	const latitude = track[last].latitude +
		fraction * (track[next].latitude - track[last].latitude)
	const longitude = track[last].longitude +
		fraction * (track[next].longitude - track[last].longitude)
	return noise({latitude, longitude})
}



const portal = http.createServer((req, res) => {
	const body = Object.assign(data(), {line: cfg.line})
	res.write(JSON.stringify(body))
	res.end()
})
portal.listen(3000)
