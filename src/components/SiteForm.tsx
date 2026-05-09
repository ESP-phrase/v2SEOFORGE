import { Button, LinkButton } from "@/components/Button";

type Site = {
  id: number;
  name: string;
  slug: string;
  wpUrl: string;
  wpUsername: string;
  niche: string;
  audience: string;
  expertVoice: string;
  authorBioHtml: string;
  maxPerDay: number;
  minWordCount: number;
  publishStatus: string;
  active: boolean;
};

export function SiteForm({
  action,
  site,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  site?: Site;
  error?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 max-w-3xl">
      {error ? (
        <div className="bg-[rgba(255,84,112,0.12)] text-danger border border-[rgba(255,84,112,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      ) : null}
      <form action={action} className="flex flex-col gap-1">
        <Field label="Name">
          <input type="text" name="name" required defaultValue={site?.name} />
        </Field>
        <Field label="Slug" hint="lowercase letters, digits, dashes">
          <input type="text" name="slug" pattern="[a-z0-9-]+" required defaultValue={site?.slug} />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Field label="WordPress URL">
            <input
              type="url"
              name="wpUrl"
              required
              placeholder="https://example.com"
              defaultValue={site?.wpUrl}
            />
          </Field>
          <Field label="WP Username">
            <input type="text" name="wpUsername" required defaultValue={site?.wpUsername} />
          </Field>
        </div>

        <Field
          label="WP Application Password"
          hint="WP Admin → Users → Profile → Application Passwords"
        >
          <input
            type="password"
            name="wpAppPassword"
            required={!site}
            placeholder={site ? "Leave blank to keep existing" : ""}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Field label="Niche" hint="short phrase">
            <input
              type="text"
              name="niche"
              placeholder="e.g. Polymarket and prediction market platforms"
              defaultValue={site?.niche}
            />
          </Field>
          <Field label="Audience" hint="short phrase">
            <input
              type="text"
              name="audience"
              placeholder="e.g. US traders new to prediction markets"
              defaultValue={site?.audience}
            />
          </Field>
        </div>

        <Field
          label="Expert voice"
          hint="2-3 sentences in first person — Claude writes as this persona"
        >
          <textarea
            name="expertVoice"
            placeholder="I've been trading on Polymarket since 2024 and run a Discord with 500+ active traders."
            defaultValue={site?.expertVoice}
            className="!min-h-[5rem]"
          />
        </Field>

        <Field
          label="Author bio HTML"
          hint="Appended to the end of every article — improves E-E-A-T signals"
        >
          <textarea
            name="authorBioHtml"
            placeholder="<p><strong>Written by Alex</strong> — independent prediction market trader.</p>"
            defaultValue={site?.authorBioHtml}
            className="!min-h-[5rem]"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Field label="Max per day">
            <input
              type="number"
              name="maxPerDay"
              min={1}
              max={50}
              defaultValue={site?.maxPerDay ?? 2}
            />
          </Field>
          <Field label="Min word count" hint="quality gate">
            <input
              type="number"
              name="minWordCount"
              min={200}
              max={5000}
              defaultValue={site?.minWordCount ?? 1000}
            />
          </Field>
          <Field label="Publish status">
            <select name="publishStatus" defaultValue={site?.publishStatus ?? "draft"}>
              <option value="draft">draft (review before going live)</option>
              <option value="publish">publish (go live immediately)</option>
            </select>
          </Field>
        </div>

        {site ? (
          <label className="inline-flex items-center gap-2 mt-3 text-sm text-text">
            <input
              type="checkbox"
              name="active"
              value="1"
              defaultChecked={site.active}
              className="!w-auto !p-0 accent-accent"
            />
            Active (can run)
          </label>
        ) : null}

        <div className="flex gap-2 flex-wrap mt-5">
          <Button type="submit">Save site</Button>
          {site ? (
            <LinkButton href={`/sites/${site.id}`} variant="secondary">
              Cancel
            </LinkButton>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3 mb-1.5">
        {label}
        {hint ? <span className="text-muted-2 normal-case tracking-normal ml-2">({hint})</span> : null}
      </label>
      {children}
    </div>
  );
}
