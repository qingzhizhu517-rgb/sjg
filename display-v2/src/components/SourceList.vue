<template>
  <section v-if="normalizedSources.length" class="source-list" aria-labelledby="source-list-heading">
    <header class="source-list__heading">
      <span class="source-list__seal" aria-hidden="true">据</span>
      <div>
        <h2 id="source-list-heading">来源资料</h2>
        <p>本页内容所据文献及原文定位</p>
      </div>
    </header>

    <ol class="source-list__entries">
      <li
        v-for="(source, index) in normalizedSources"
        :key="source.sourceId ?? `${source.title}-${index}`"
        class="source-list__entry"
      >
        <div class="source-list__identity">
          <span class="source-list__index" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <div>
            <h3 v-if="source.title" class="source-list__title">
              <a
                v-if="safeSourceUrl(source.url)"
                :href="safeSourceUrl(source.url)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ source.title }}<span class="source-list__external" aria-hidden="true">↗</span>
              </a>
              <span v-else>{{ source.title }}</span>
            </h3>
            <a
              v-else-if="safeSourceUrl(source.url)"
              class="source-list__open"
              :href="safeSourceUrl(source.url)"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看原文<span aria-hidden="true">↗</span>
            </a>
            <p v-if="source.authorOrg || source.publicationYear !== ''" class="source-list__meta">
              <span v-if="source.authorOrg">{{ source.authorOrg }}</span>
              <span v-if="source.authorOrg && source.publicationYear !== ''" aria-hidden="true">·</span>
              <span v-if="source.publicationYear !== ''">{{ source.publicationYear }} 年</span>
            </p>
          </div>
        </div>

        <div class="source-list__evidence">
          <p v-if="source.citation" class="source-list__citation">
            <span>规范引用</span>
            <cite>{{ source.citation }}</cite>
          </p>

          <dl v-if="source.locator || source.note" class="source-list__details">
            <div v-if="source.locator">
              <dt>原文定位</dt>
              <dd>{{ source.locator }}</dd>
            </div>
            <div v-if="source.note">
              <dt>关联说明</dt>
              <dd>{{ source.note }}</dd>
            </div>
          </dl>

          <blockquote v-if="source.quote" class="source-list__quote">
            <span>原文摘录</span>
            <p>{{ source.quote }}</p>
          </blockquote>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeSourceEntries, safeSourceUrl } from '../utils/source'

const props = defineProps({
  sources: { type: Array, default: () => [] },
})

const normalizedSources = computed(() => normalizeSourceEntries(props.sources))
</script>

<style scoped>
.source-list {
  width: 100%;
  text-align: left;
}

.source-list__heading {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}

.source-list__seal {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
  color: var(--text-on-accent);
  background: var(--accent);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--fs-body);
  font-weight: 600;
  transform: rotate(-2deg);
}

.source-list__heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-lead);
  font-weight: 600;
  letter-spacing: 2px;
}

.source-list__heading p {
  margin: var(--sp-1) 0 0;
  color: var(--text-muted);
  font-size: var(--fs-caption);
  line-height: var(--lh-body);
}

.source-list__entries {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--border);
}

.source-list__entry {
  display: grid;
  grid-template-columns: minmax(220px, 0.38fr) minmax(0, 1fr);
  gap: var(--sp-6);
  padding: var(--sp-5) 0;
  border-bottom: 1px solid var(--border-light);
}

.source-list__identity {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: var(--sp-3);
  align-items: start;
}

.source-list__index {
  color: var(--accent);
  font-family: var(--font-display);
  font-size: var(--fs-caption);
  line-height: 1.7;
}

.source-list__title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-body);
  font-weight: 600;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.source-list__title a,
.source-list__open {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--accent-a35);
  text-underline-offset: 4px;
}

.source-list__title a:hover,
.source-list__open:hover {
  color: var(--accent);
  text-decoration-color: var(--accent);
}

.source-list__external,
.source-list__open span {
  display: inline-block;
  margin-left: var(--sp-2);
  color: var(--accent);
  font-size: var(--fs-caption);
}

.source-list__open {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
}

.source-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin: var(--sp-2) 0 0;
  color: var(--text-muted);
  font-size: var(--fs-caption);
  line-height: var(--lh-body);
}

.source-list__evidence {
  min-width: 0;
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  line-height: var(--lh-body);
}

.source-list__citation {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: var(--sp-3);
  margin: 0 0 var(--sp-3);
}

.source-list__citation > span,
.source-list__details dt,
.source-list__quote > span {
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 1px;
}

.source-list__citation cite {
  color: var(--text-secondary);
  font-style: normal;
  overflow-wrap: anywhere;
}

.source-list__details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-6);
  margin: 0;
}

.source-list__details > div {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: var(--sp-3);
  flex: 1 1 240px;
}

.source-list__details dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.source-list__quote {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: var(--sp-3);
  margin: var(--sp-4) 0 0;
  padding: var(--sp-3) var(--sp-4);
  background: var(--accent-faint);
  border-left: 2px solid var(--accent-a35);
}

.source-list__quote p {
  margin: 0;
  color: var(--text-primary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 720px) {
  .source-list__entry {
    grid-template-columns: 1fr;
    gap: var(--sp-4);
  }

  .source-list__evidence {
    padding-left: 44px;
  }

  .source-list__citation,
  .source-list__details > div,
  .source-list__quote {
    grid-template-columns: 1fr;
    gap: var(--sp-1);
  }
}

@media (max-width: 420px) {
  .source-list__evidence {
    padding-left: 0;
  }
}
</style>
