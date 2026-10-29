#!/bin/bash
# Ghép mã nguồn trong src/ thành ../index.html (bản web chạy trên GitHub Pages, cũng được gói vào app Android)
set -e
cd "$(dirname "$0")"
FILES="b_core.js c_data.js c3_protocols.js d1_world_assets.js d2_char_assets.js d3_icons.js e1_world.js e2_people.js e3_render.js f_mouth.js g_views.js h_exam.js i_steps.js j_treat_loop.js j2_result.js k1_ui.js k2_onboard.js"
{
  cat page_head.html
  cat a_head.html
  echo '<script>'; for f in $FILES; do cat "$f"; echo; done; echo '</script>'
  cat page_tail.html
} > ../index.html
wc -c ../index.html
