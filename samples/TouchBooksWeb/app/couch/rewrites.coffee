module.exports = [
  # static
  from: "/public/*"
  to: "public/*"
,
  from: "/css/*"
  to: "css/*"

, # spine
  require('spine-adapter/rewrites')

, # show root
  from: "/"
  to: "_show/index"  
]