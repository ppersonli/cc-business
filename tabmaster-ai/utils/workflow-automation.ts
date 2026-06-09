/**
 * Workflow Automation for TabMaster AI.
 * Users define named workflows (lists of tabs to open) and execute them in one click.
 * Free tier: max 3 workflows. Pro: unlimited.
 */

export const MAX_FREE_WORKFLOWS = 3;

export interface WorkflowTab {
  url: string;
  title: string;
}

export interface Workflow {
  id: string;
  name: string;
  tabs: WorkflowTab[];
  createdAt: number;
}

export type WorkflowInput = Omit<Workflow, 'createdAt'> & { createdAt?: number };

const STORAGE_KEY = 'workflows';

/**
 * Get all saved workflows from storage.
 */
export async function getWorkflows(): Promise<Workflow[]> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    return (data[STORAGE_KEY] as Workflow[]) || [];
  }
  // Dev/test fallback
  const raw = localStorage.getItem(`tabmaster_local_${STORAGE_KEY}`);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Save a workflow. If id matches an existing workflow, it is updated.
 * Returns null if free tier limit is reached.
 */
export async function saveWorkflow(
  input: { id?: string; name: string; tabs: WorkflowTab[] },
  isPro: boolean,
): Promise<Workflow | null> {
  const workflows = await getWorkflows();

  // Check if this is an update
  const existingIdx = input.id ? workflows.findIndex(w => w.id === input.id) : -1;
  const isUpdate = existingIdx >= 0;

  if (!isUpdate && !isPro && workflows.length >= MAX_FREE_WORKFLOWS) {
    return null;
  }

  const workflow: Workflow = {
    id: input.id || `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    tabs: input.tabs,
    createdAt: Date.now(),
  };

  if (isUpdate) {
    workflows[existingIdx] = workflow;
  } else {
    workflows.push(workflow);
  }

  await persist(workflows);
  return workflow;
}

/**
 * Delete a workflow by id.
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const workflows = await getWorkflows();
  const filtered = workflows.filter(w => w.id !== id);
  await persist(filtered);
}

/**
 * Execute a workflow by opening all its tabs.
 */
export async function executeWorkflow(workflow: Workflow): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    for (const tab of workflow.tabs) {
      await chrome.tabs.create({ url: tab.url });
    }
  }
}

async function persist(workflows: Workflow[]): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ [STORAGE_KEY]: workflows });
  } else {
    localStorage.setItem(`tabmaster_local_${STORAGE_KEY}`, JSON.stringify(workflows));
  }
}
