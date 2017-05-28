<template lang="pug">
	.container
		h2.title {{ _('Acitivities') }}

		.header.flex.row.justify-space-between
			.group.sort
				a.link(@click="changeSort('-votes')", :class="{ active: sort == '-votes' }") {{ _("Hot") }}
				a.link(@click="changeSort('-views')", :class="{ active: sort == '-views' }") {{ _("MostViewed") }}
				a.link(@click="changeSort('-createdAt')", :class="{ active: sort == '-createdAt' }") {{ _("New") }}

			button.button.primary(@click="newPost")
				span.icon
					i.fa.fa-plus
				span {{ _("NewPost") }}

		.postForm(v-if="showForm")
			vue-form-generator(:schema='schema', :model='model', :options='{}', :multiple="false", ref="form", :is-new-model="isNewPost")

			.group.buttons
				button.button.primary(@click="savePost") {{ _("Save") }}
				button.button(@click="cancelPost") {{ _("Cancel") }}


		transition-group.activities(name="activity", tag="ul")
			li(v-for="(activity, index) of activities", :key="activity.code").activityItem
				article.media
					.media-content
						h4 {{ activity.userId }}
						h5 {{ activity.desc }}
						p {{ isTurn(activity, index) }}
						div(v-for="(user, index) of activity.users", :key="user.code").activityUser
							
							img(:src="user.avatar")
							div.username {{ user.fullName}}
							// input(type="checkbox", name="completed", checked=(isTurn(index)) ? "checked" : undefined))

		.loadMore.text-center(v-if="hasMore")
			button.button.outline(@click="loadMoreRows", :class="{ 'loading': fetching }") {{ _("LoadMore") }}
		.noMore.text-center(v-if="!hasMore")
			span.text-muted You reached the end of the list.
		hr
</template>

<script>
	import Vue from "vue";
	import marked from "marked";
	import toast from "../../core/toastr";
	import { cloneDeep } from "lodash";
	import { validators, schema as schemaUtils } from "vue-form-generator";

	import { mapGetters, mapActions } from "vuex";

	export default {

		computed: {
			...mapGetters("activities", [
				"activities",
				"hasMore",
				"fetching",
				"sort",
				"viewMode"
			]),
			...mapGetters("session", [
				"me"
			])
		},

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				showForm: false,
				isNewPost: false,
				model: null,
				schema: {
					fields: [
						{
							type: "text",
							label: this._("Desc"),
							model: "desc",
							featured: true,
							required: true,
							placeholder: this._("DescOfPost"),
							validator: validators.string
						},
						{
							type: "Number",
							label: this._("UserId"),
							model: "userId",
							featured: true,
							required: true,
							placeholder: this._("UserIdOf"),
							validator: validators.Number
						},
					]
				}
			};
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {

			prefix: "/activities/",

			events: {
				/**
				 * New device added
				 * @param  {Object} res Device object
				 */
				/*

				/**
				 * Activity updated
				 * @param  {Object} res Post object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("ActivityNameUpdated", res), this._("ActivityUpdated"));
				},

				/**
				 * Activity removed
				 * @param  {Object} res Activity object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("ActivityNameDeleted", res), this._("ActivityDeleted"));
				}
			}
		},	

		methods: {
			...mapActions("activities", [
				"getRows",
				"loadMoreRows",
				"changeSort",
				"changeViewMode",
				"vote",
				"unVote",
				"saveRow",
				"updateRow",
				"removeRow",
				"updated",
				"removed"
			]),

			markdown(content) {
				return marked(content);
			},

			newPost() {
				this.model = schemaUtils.createDefaultObject(this.schema);
				this.showForm = true;
				this.isNewPost = true;

				this.focusFirstInput();
			},

			editPost(post) {
				this.model = cloneDeep(post);
				this.showForm = true;
				this.isNewPost = false;
				this.focusFirstInput();
			},

			focusFirstInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-control:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			},

			focusFirstErrorInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-group.error .form-control");
					if (el)
						el.focus();
				});
			},			

			savePost() {
				if (this.$refs.form.validate()) {
					if (this.isNewPost)
                    {
                        console.log('Saving row?');
                        this.saveRow(this.model);
                    }
					else
						this.updateRow(this.model);

					this.cancelPost();
				} else {
					this.focusFirstErrorInput();
				}
			},

			cancelPost() {
				this.showForm = false;
				this.model = null;
			},

			deletePost(post) {
				this.removeRow(post);
			},
			isTurn(activity) {
				console.log(activity);
				return "It is " + activity.turn.fullName + "s turn";
			}

		},

		/**
		 * Call if the component is created
		 */
		created() {
			this.getRows();
		}
	};
</script>

<style lang="scss" scoped>

	@import "../../../scss/themes/blurred/variables";
	@import "../../../scss/common/mixins";

	.container {
		padding-bottom: 1rem;
	}

	.header {
		margin: 1rem;
	}

	.postForm {

		@include bgTranslucentDark(0.2);

		margin: 1rem;

		.buttons {
			padding: 0.5em;
		}

	} // .postForm

	ul.posts {
		margin: 1rem 3rem;
		padding: 0;
		list-style: none;

		li {
			position: relative;
			margin: 1.0rem 0;
			padding: 0.5rem 0.5rem;
			font-size: 1.1rem;

			.media {
				background-color: rgba($color1, 0.5);
				transition: background-color .2s ease;
				&:hover {
					background-color: rgba($color1, 0.8);
				}
			}

			.votes {

				.count {
					font-weight: 300;
					font-size: 3.0em;
					margin: 1.5rem 0 2.0rem 0;
				}

				.thumb {
					cursor: pointer;
					font-size: 2.0em;

					&:hover {
						color: $headerTextColor;
					}

				}

				&.voted {
					.thumb {
						color: $successColor;

						&:hover {
							color: lighten($successColor, 10%);
						}
					}
				}

			} // .votes

			.voters {
				margin: 0 1em;
				img {
					margin: 0 0.4em;
					width: 32px;
					height: 32px;
					border-radius: $avatarRadius;
				}
			}

			.media-content {				
				overflow-x: auto;
				
				h3 {
					margin: 0 0 0.5em 0;
				}

			}
		}
	}


	/* Transition styles */
/*
	.post-transition {
		transition: opacity .5s ease;
	}

	.post-enter {
		opacity: 0;
	}

	.post-leave {
		opacity: 0;
		position: absolute !important;
	}
*/
	.post-move {
		transition: transform .5s cubic-bezier(.55,0,.1,1);
	}



</style>