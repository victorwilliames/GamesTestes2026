extends SceneTree

const BASE_DIR := "res://docs/migration/visual/"

func _init() -> void:
	print("[CompareFXAA] Starting image analysis and zoom strips generation...")
	var modes := [
		{"name": "FULL (0.035 const)", "file": "fxaa_threshold_full.png"},
		{"name": "THR 0.035 (uniform)", "file": "fxaa_threshold_fxaa_thr035.png"},
		{"name": "THR 0.050", "file": "fxaa_threshold_fxaa_thr050.png"},
		{"name": "THR 0.070", "file": "fxaa_threshold_fxaa_thr070.png"},
		{"name": "NO_FXAA (Raw 3D)", "file": "fxaa_threshold_no_fxaa.png"},
	]

	var imgs := {}
	for m: Dictionary in modes:
		var p: String = BASE_DIR + String(m["file"])
		var img := Image.load_from_file(ProjectSettings.globalize_path(p))
		if img == null:
			push_error("Failed to load " + p)
			quit(1)
			return
		imgs[m["name"]] = img

	var full_img: Image = imgs["FULL (0.035 const)"]
	var thr035_img: Image = imgs["THR 0.035 (uniform)"]
	var thr050_img: Image = imgs["THR 0.050"]
	var thr070_img: Image = imgs["THR 0.070"]
	var nofx_img: Image = imgs["NO_FXAA (Raw 3D)"]

	var w := full_img.get_width()
	var h := full_img.get_height()
	print("[CompareFXAA] Loaded images size: %dx%d" % [w, h])

	# 1. Compare differences
	_compare_diff("FULL vs THR 0.035 (Control)", full_img, thr035_img)
	_compare_diff("THR 0.035 vs THR 0.050", thr035_img, thr050_img)
	_compare_diff("THR 0.035 vs THR 0.070", thr035_img, thr070_img)
	_compare_diff("FULL vs NO_FXAA", full_img, nofx_img)

	# 2. Generate 4x zoom strips
	# Caitlyn center: Rect2i(610, 430, 60, 80)
	_generate_zoom_strip(modes, imgs, Rect2i(610, 430, 60, 80), 4, "fxaa_thr_caitlyn_zoom_4x.png")
	# Static dummy: Rect2i(690, 310, 70, 80)
	_generate_zoom_strip(modes, imgs, Rect2i(690, 310, 70, 80), 4, "fxaa_thr_dummy_zoom_4x.png")
	# Grid lines & ring: Rect2i(550, 460, 80, 80)
	_generate_zoom_strip(modes, imgs, Rect2i(550, 460, 80, 80), 4, "fxaa_thr_grid_ring_zoom_4x.png")

	print("[CompareFXAA] Finished generating zoom strips.")
	quit(0)

func _compare_diff(label: String, a: Image, b: Image) -> void:
	var w := a.get_width()
	var h := a.get_height()
	var diff_count := 0
	var max_diff := 0.0
	for y in range(h):
		for x in range(w):
			var ca := a.get_pixel(x, y)
			var cb := b.get_pixel(x, y)
			var dr := absf(ca.r - cb.r)
			var dg := absf(ca.g - cb.g)
			var db := absf(ca.b - cb.b)
			var d := maxf(dr, maxf(dg, db))
			if d > 0.001:
				diff_count += 1
				if d > max_diff:
					max_diff = d
	print("[CompareFXAA] %s: diff_pixels=%d (%.2f%%) max_channel_diff=%.4f" % [
		label, diff_count, (float(diff_count) / float(w * h)) * 100.0, max_diff
	])

func _generate_zoom_strip(modes: Array, imgs: Dictionary, crop: Rect2i, scale: int, out_name: String) -> void:
	var cw := crop.size.x
	var ch := crop.size.y
	var zw := cw * scale
	var zh := ch * scale
	var margin := 10
	var total_w := (zw + margin) * modes.size() + margin
	var total_h := zh + 30

	var strip := Image.create(total_w, total_h, false, Image.FORMAT_RGBA8)
	strip.fill(Color(0.07, 0.07, 0.09, 1.0))

	for i in range(modes.size()):
		var mname: String = modes[i]["name"]
		var src: Image = imgs[mname]
		var sub := src.get_region(crop)
		sub.resize(zw, zh, Image.INTERPOLATE_NEAREST)
		var x_pos := margin + i * (zw + margin)
		var y_pos := 20
		strip.blit_rect(sub, Rect2i(0, 0, zw, zh), Vector2i(x_pos, y_pos))

	var save_path := BASE_DIR + out_name
	var err := strip.save_png(ProjectSettings.globalize_path(save_path))
	if err == OK:
		print("[CompareFXAA] Saved zoom strip: ", save_path)
	else:
		push_error("Failed to save " + save_path)
