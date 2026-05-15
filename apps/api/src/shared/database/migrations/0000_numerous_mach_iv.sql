CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "vector";
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "form_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"help_text" text,
	"type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_questions_section_id_position_unique" UNIQUE("section_id","position"),
	CONSTRAINT "form_questions_type_check" CHECK ("form_questions"."type" in (
        'short_answer',
        'long_answer',
        'email',
        'number',
        'multiple_choice',
        'checkbox',
        'dropdown',
        'rating_scale'
      ))
);
--> statement-breakpoint
CREATE TABLE "form_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_sections_form_id_position_unique" UNIQUE("form_id","position")
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"quality_status" text DEFAULT 'not_checked' NOT NULL,
	"insight_status" text DEFAULT 'not_ready' NOT NULL,
	"current_draft_version" integer DEFAULT 1 NOT NULL,
	"latest_published_version" integer,
	"public_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	CONSTRAINT "forms_public_slug_unique" UNIQUE("public_slug"),
	CONSTRAINT "forms_status_check" CHECK ("forms"."status" in ('draft', 'published', 'closed')),
	CONSTRAINT "forms_quality_status_check" CHECK ("forms"."quality_status" in ('not_checked', 'passed', 'needs_review')),
	CONSTRAINT "forms_insight_status_check" CHECK ("forms"."insight_status" in ('not_ready', 'processing', 'ready', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "generated_form_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"guided_options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_schema" jsonb NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"accepted_form_id" uuid,
	"model_provider" text,
	"model_name" text,
	"prompt_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generated_form_drafts_status_check" CHECK ("generated_form_drafts"."status" in ('generated', 'accepted', 'discarded'))
);
--> statement-breakpoint
CREATE TABLE "published_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"schema" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "published_forms_form_id_version_unique" UNIQUE("form_id","version")
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"published_form_id" uuid NOT NULL,
	"respondent_email" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completion_time_seconds" integer,
	"respondent_fingerprint" text,
	"user_agent" text,
	"ip_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "form_responses_completion_time_seconds_check" CHECK ("form_responses"."completion_time_seconds" is null or "form_responses"."completion_time_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "response_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text NOT NULL,
	"answer" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"sentiment" text NOT NULL,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"pain_points" text[] DEFAULT '{}' NOT NULL,
	"feature_requests" text[] DEFAULT '{}' NOT NULL,
	"follow_up_needed" boolean DEFAULT false NOT NULL,
	"follow_up_reason" text,
	"model_provider" text NOT NULL,
	"model_name" text NOT NULL,
	"prompt_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "response_analyses_response_id_unique" UNIQUE("response_id"),
	CONSTRAINT "response_analyses_sentiment_check" CHECK ("response_analyses"."sentiment" in ('positive', 'neutral', 'negative', 'mixed'))
);
--> statement-breakpoint
CREATE TABLE "response_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"response_id" uuid NOT NULL,
	"answer_id" uuid,
	"content_kind" text NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"model_provider" text NOT NULL,
	"model_name" text NOT NULL,
	"embedding_dimensions" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "response_embeddings_response_content_model_unique" UNIQUE("response_id","content_hash","model_name"),
	CONSTRAINT "response_embeddings_content_kind_check" CHECK ("response_embeddings"."content_kind" in ('long_answer', 'response_summary', 'pain_point', 'feature_request'))
);
--> statement-breakpoint
CREATE TABLE "form_quality_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"summary" text,
	"model_provider" text,
	"model_name" text,
	"prompt_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text,
	CONSTRAINT "form_quality_checks_status_check" CHECK ("form_quality_checks"."status" in ('processing', 'completed', 'failed')),
	CONSTRAINT "form_quality_checks_score_check" CHECK ("form_quality_checks"."score" is null or ("form_quality_checks"."score" >= 0 and "form_quality_checks"."score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "form_quality_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quality_check_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"section_id" uuid,
	"question_id" uuid,
	"severity" text NOT NULL,
	"issue_type" text NOT NULL,
	"problem" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"suggested_fix" jsonb,
	"status" text DEFAULT 'open' NOT NULL,
	"is_safe_auto_fix" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_quality_issues_severity_check" CHECK ("form_quality_issues"."severity" in ('high', 'medium', 'low')),
	CONSTRAINT "form_quality_issues_status_check" CHECK ("form_quality_issues"."status" in ('open', 'applied', 'ignored'))
);
--> statement-breakpoint
CREATE TABLE "insight_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"status" text NOT NULL,
	"total_responses" integer DEFAULT 0 NOT NULL,
	"sentiment_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"overview_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_metrics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"key_findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dropoff_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"model_provider" text,
	"model_name" text,
	"prompt_version" text,
	"generated_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insight_snapshots_status_check" CHECK ("insight_snapshots"."status" in ('pending', 'processing', 'ready', 'failed')),
	CONSTRAINT "insight_snapshots_total_responses_check" CHECK ("insight_snapshots"."total_responses" >= 0)
);
--> statement-breakpoint
CREATE TABLE "response_cluster_members" (
	"cluster_id" uuid NOT NULL,
	"response_id" uuid NOT NULL,
	"similarity_score" numeric,
	CONSTRAINT "response_cluster_members_cluster_id_response_id_pk" PRIMARY KEY("cluster_id","response_id")
);
--> statement-breakpoint
CREATE TABLE "response_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"insight_snapshot_id" uuid,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"sentiment" text NOT NULL,
	"response_count" integer NOT NULL,
	"representative_quotes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_action" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "response_clusters_sentiment_check" CHECK ("response_clusters"."sentiment" in ('positive', 'neutral', 'negative', 'mixed')),
	CONSTRAINT "response_clusters_response_count_check" CHECK ("response_clusters"."response_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"insight_snapshot_id" uuid,
	"report_type" text NOT NULL,
	"status" text NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text,
	"model_provider" text,
	"model_name" text,
	"prompt_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_at" timestamp with time zone,
	"error_message" text,
	CONSTRAINT "reports_report_type_check" CHECK ("reports"."report_type" in ('executive_summary', 'feedback_report')),
	CONSTRAINT "reports_status_check" CHECK ("reports"."status" in ('generating', 'ready', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "form_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "form_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"form_id" uuid NOT NULL,
	"published_form_id" uuid,
	"response_id" uuid,
	"event_type" text NOT NULL,
	"section_id" uuid,
	"question_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_events_event_type_check" CHECK ("form_events"."event_type" in (
        'form_opened',
        'form_started',
        'section_reached',
        'question_focused',
        'form_submitted'
      ))
);
--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_section_id_form_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."form_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_sections" ADD CONSTRAINT "form_sections_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_form_drafts" ADD CONSTRAINT "generated_form_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_form_drafts" ADD CONSTRAINT "generated_form_drafts_accepted_form_id_forms_id_fk" FOREIGN KEY ("accepted_form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "published_forms" ADD CONSTRAINT "published_forms_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_published_form_id_published_forms_id_fk" FOREIGN KEY ("published_form_id") REFERENCES "public"."published_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_analyses" ADD CONSTRAINT "response_analyses_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_analyses" ADD CONSTRAINT "response_analyses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_embeddings" ADD CONSTRAINT "response_embeddings_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_embeddings" ADD CONSTRAINT "response_embeddings_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_embeddings" ADD CONSTRAINT "response_embeddings_answer_id_response_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."response_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_quality_checks" ADD CONSTRAINT "form_quality_checks_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_quality_issues" ADD CONSTRAINT "form_quality_issues_quality_check_id_form_quality_checks_id_fk" FOREIGN KEY ("quality_check_id") REFERENCES "public"."form_quality_checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_quality_issues" ADD CONSTRAINT "form_quality_issues_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_snapshots" ADD CONSTRAINT "insight_snapshots_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_cluster_members" ADD CONSTRAINT "response_cluster_members_cluster_id_response_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."response_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_cluster_members" ADD CONSTRAINT "response_cluster_members_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_clusters" ADD CONSTRAINT "response_clusters_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_clusters" ADD CONSTRAINT "response_clusters_insight_snapshot_id_insight_snapshots_id_fk" FOREIGN KEY ("insight_snapshot_id") REFERENCES "public"."insight_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_insight_snapshot_id_insight_snapshots_id_fk" FOREIGN KEY ("insight_snapshot_id") REFERENCES "public"."insight_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_events" ADD CONSTRAINT "form_events_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_events" ADD CONSTRAINT "form_events_published_form_id_published_forms_id_fk" FOREIGN KEY ("published_form_id") REFERENCES "public"."published_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_events" ADD CONSTRAINT "form_events_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_questions_section_id_position_idx" ON "form_questions" USING btree ("section_id","position");--> statement-breakpoint
CREATE INDEX "form_sections_form_id_position_idx" ON "form_sections" USING btree ("form_id","position");--> statement-breakpoint
CREATE INDEX "forms_owner_user_id_updated_at_idx" ON "forms" USING btree ("owner_user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "forms_status_idx" ON "forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generated_form_drafts_user_id_created_at_idx" ON "generated_form_drafts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "published_forms_form_id_version_idx" ON "published_forms" USING btree ("form_id","version" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "form_responses_form_id_submitted_at_idx" ON "form_responses" USING btree ("form_id","submitted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "response_answers_response_id_idx" ON "response_answers" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "response_analyses_form_id_idx" ON "response_analyses" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "response_analyses_sentiment_idx" ON "response_analyses" USING btree ("sentiment");--> statement-breakpoint
CREATE INDEX "response_embeddings_form_id_idx" ON "response_embeddings" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "response_embeddings_response_id_idx" ON "response_embeddings" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "form_quality_checks_form_id_created_at_idx" ON "form_quality_checks" USING btree ("form_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "form_quality_issues_quality_check_id_idx" ON "form_quality_issues" USING btree ("quality_check_id");--> statement-breakpoint
CREATE INDEX "form_quality_issues_form_id_status_idx" ON "form_quality_issues" USING btree ("form_id","status");--> statement-breakpoint
CREATE INDEX "insight_snapshots_form_id_created_at_idx" ON "insight_snapshots" USING btree ("form_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "response_cluster_members_response_id_idx" ON "response_cluster_members" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "response_clusters_form_id_idx" ON "response_clusters" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "response_clusters_insight_snapshot_id_idx" ON "response_clusters" USING btree ("insight_snapshot_id");--> statement-breakpoint
CREATE INDEX "reports_form_id_created_at_idx" ON "reports" USING btree ("form_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "form_events_form_id_occurred_at_idx" ON "form_events" USING btree ("form_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "form_events_published_form_id_event_type_idx" ON "form_events" USING btree ("published_form_id","event_type");
