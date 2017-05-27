<template lang="pug">
	nav.navbar.navbar-toggleable-md.navbar-light.bg-faded
		button.navbar-toggler.navbar-toggler-right(type="button", data-toggle="collapse", data-target="#navbarNavDropdown", aria-controls="navbarNavDropdown", aria-expanded="false", aria-label="Toggle navigation")
			span.navbar-toggler-icon
		a.navbar-brand(href="#") Moocher
		div.collapse.navbar-collapse#navbarNavDropdown
			ul.navbar-nav
				li.nav-item.active
					a.nav-link(href="#") Home
				li.nav-item
					a.nav-link(href="#") Profile
</template>

<script>
	import Logo from "./logo";
	import SearchBox from "./search-box";
	import UserBox from "./user-box";

	export default {
		components: {
			Logo,
			SearchBox,
			UserBox
		},

		props: [
		]

	};
	
</script>

<style lang="scss">
</style>