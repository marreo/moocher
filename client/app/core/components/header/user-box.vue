<template lang="pug">
	.user-box(v-if="me")
	
		.user-info.right(@click="toggleUserMenu()")
			img.avatar(:src='me.avatar')
			.username {{ me.fullName }}
			i.fa.fa-chevron-down

		user-dropdown(:visible="expandedUserMenu")


</template>

<script>
	import UserDropdown from "./dropdowns/user";

	import { mapActions, mapGetters } from "vuex";

	export default {
		computed: mapGetters("session", [
			"me",
		]),

		components: {
			UserDropdown,
		},

		data() {
			return {
				expandedUserMenu: false,
			};
		},

		methods: {

			toggleUserMenu() {
				this.expandedUserMenu = !this.expandedUserMenu;
			}

		}

	};
	
</script>

<style lang="scss">
</style>