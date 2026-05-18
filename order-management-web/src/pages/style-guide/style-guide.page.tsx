import { useState, type ReactNode } from 'react';
import { Container } from '@components/ui/container';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select } from '@components/ui/select';
import { FormField } from '@components/ui/form-field';
import { Badge } from '@components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationStatus,
} from '@components/ui/pagination';
import { Separator } from '@components/ui/separator';
import { Spinner } from '@components/ui/spinner';
import { cn } from '@lib/cn';

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

function Section({ id, title, description, children }: SectionProps): JSX.Element {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description !== undefined && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="rounded-lg border border-border bg-background p-6">{children}</div>
    </section>
  );
}

interface TokenSwatchProps {
  name: string;
  hex: string;
  className: string;
  textOn?: 'light' | 'dark';
}

function TokenSwatch({ name, hex, className, textOn = 'dark' }: TokenSwatchProps): JSX.Element {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex h-16 items-end rounded-md border border-border p-2 text-xs font-mono',
          className,
          textOn === 'light' ? 'text-white' : 'text-foreground',
        )}
      >
        {hex}
      </div>
      <div className="text-xs font-medium text-foreground">{name}</div>
    </div>
  );
}

const SEMANTIC_TOKENS: Array<{ name: string; hex: string; className: string; textOn?: 'light' | 'dark' }> = [
  { name: 'background', hex: '#ffffff', className: 'bg-background' },
  { name: 'foreground', hex: '#0f172a', className: 'bg-foreground', textOn: 'light' },
  { name: 'muted', hex: '#f8fafc', className: 'bg-muted' },
  { name: 'muted-foreground', hex: '#64748b', className: 'bg-muted-foreground', textOn: 'light' },
  { name: 'border', hex: '#e2e8f0', className: 'bg-border' },
  { name: 'primary', hex: '#2563eb', className: 'bg-primary', textOn: 'light' },
  { name: 'accent', hex: '#eff6ff', className: 'bg-accent' },
  { name: 'destructive', hex: '#dc2626', className: 'bg-destructive', textOn: 'light' },
  { name: 'success', hex: '#16a34a', className: 'bg-success', textOn: 'light' },
  { name: 'warning', hex: '#ca8a04', className: 'bg-warning', textOn: 'light' },
  { name: 'info-subtle', hex: '#eff6ff', className: 'bg-info-subtle' },
];

const SLATE_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const BLUE_SHADES = [50, 100, 200, 300, 400, 500, 600, 700] as const;

const TYPOGRAPHY_SCALE = [
  { className: 'text-xs', label: 'text-xs (0.75rem · 12px)' },
  { className: 'text-sm', label: 'text-sm (0.875rem · 14px)' },
  { className: 'text-base', label: 'text-base (1rem · 16px)' },
  { className: 'text-lg', label: 'text-lg (1.125rem · 18px)' },
  { className: 'text-xl', label: 'text-xl (1.25rem · 20px)' },
  { className: 'text-2xl', label: 'text-2xl (1.5rem · 24px)' },
  { className: 'text-3xl', label: 'text-3xl (1.875rem · 30px)' },
] as const;

const RADII = [
  { className: 'rounded-sm', label: 'rounded-sm' },
  { className: 'rounded', label: 'rounded (md)' },
  { className: 'rounded-lg', label: 'rounded-lg' },
  { className: 'rounded-full', label: 'rounded-full' },
] as const;

const DUMMY_ROWS = [
  { id: 1, paciente: 'María González', medicamento: 'Atorvastatina 20mg', estado: 'ACTIVO' as const },
  { id: 2, paciente: 'José Pérez', medicamento: 'Losartán 50mg', estado: 'EN PROCESO' as const },
  { id: 3, paciente: 'Ana Rodríguez', medicamento: 'Metformina 850mg', estado: 'ENTREGADO' as const },
  { id: 4, paciente: 'Carlos López', medicamento: 'Omeprazol 20mg', estado: 'CANCELADO' as const },
  { id: 5, paciente: 'Laura Díaz', medicamento: 'Enalapril 10mg', estado: 'ACTIVO' as const },
];

export function StyleGuidePage(): JSX.Element {
  const [demoTab, setDemoTab] = useState('one');
  const [demoPage, setDemoPage] = useState(1);
  const totalPages = 8;

  return (
    <Container size="lg">
      <main className="py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Style Guide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de diseño minimalista — paleta neutral con acento azul, tipografía Inter, primitivos reutilizables.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1 text-sm">
              {[
                ['tokens', 'Design tokens'],
                ['typography', 'Typography'],
                ['button', 'Button'],
                ['form', 'Form controls'],
                ['badge', 'Badge'],
                ['alert', 'Alert'],
                ['card', 'Card'],
                ['tabs', 'Tabs'],
                ['table', 'Table'],
                ['pagination', 'Pagination'],
                ['misc', 'Separator + Spinner'],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            {/* ── Design tokens ── */}
            <Section
              id="tokens"
              title="Design tokens"
              description="Paleta semántica, escalas base, radios y muestras de color."
            >
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Semantic colors</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {SEMANTIC_TOKENS.map(t => {
                      const props = t.textOn !== undefined
                        ? { name: t.name, hex: t.hex, className: t.className, textOn: t.textOn }
                        : { name: t.name, hex: t.hex, className: t.className };
                      return <TokenSwatch key={t.name} {...props} />;
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Slate scale</h3>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {SLATE_SHADES.map(s => (
                      <div key={s} className="space-y-1">
                        <div className={cn('h-12 rounded-md border border-border', `bg-slate-${s}`)} />
                        <div className="text-center text-xs font-mono text-muted-foreground">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Blue scale (acento)</h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {BLUE_SHADES.map(s => (
                      <div key={s} className="space-y-1">
                        <div className={cn('h-12 rounded-md border border-border', `bg-blue-${s}`)} />
                        <div className="text-center text-xs font-mono text-muted-foreground">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Radii</h3>
                  <div className="flex flex-wrap gap-4">
                    {RADII.map(r => (
                      <div key={r.className} className="text-center">
                        <div className={cn('h-14 w-14 border border-border bg-muted', r.className)} />
                        <div className="mt-1 text-xs font-mono text-muted-foreground">{r.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Typography ── */}
            <Section
              id="typography"
              title="Typography"
              description="Escala tipográfica basada en Inter."
            >
              <div className="space-y-3">
                {TYPOGRAPHY_SCALE.map(t => (
                  <div key={t.className} className="flex items-baseline gap-4">
                    <span className="w-48 shrink-0 text-xs font-mono text-muted-foreground">
                      {t.label}
                    </span>
                    <span className={cn(t.className, 'text-foreground')}>
                      The quick brown fox jumps over the lazy dog
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Button ── */}
            <Section
              id="button"
              title="Button"
              description="Botones con 6 variantes y 4 tamaños. Soporta isLoading + loadingText."
            >
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" aria-label="icon">⚙</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button isLoading loadingText="Guardando...">Submit</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </Section>

            {/* ── Form ── */}
            <Section
              id="form"
              title="Form controls"
              description="Input, Textarea y Select envueltos con FormField (label, helper, error)."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Email" required helper="Te enviaremos confirmación aquí.">
                  <Input type="email" placeholder="tu@dominio.com" />
                </FormField>
                <FormField label="Contraseña" error="Mínimo 8 caracteres">
                  <Input type="password" defaultValue="abc" variant="error" />
                </FormField>
                <FormField label="País">
                  <Select defaultValue="co">
                    <option value="co">Colombia</option>
                    <option value="mx">México</option>
                    <option value="ar">Argentina</option>
                  </Select>
                </FormField>
                <FormField label="Nombre completo" helper="Campo deshabilitado">
                  <Input disabled defaultValue="John Doe" />
                </FormField>
                <FormField label="Comentario" className="sm:col-span-2">
                  <Textarea placeholder="Escribe aquí..." />
                </FormField>
              </div>
            </Section>

            {/* ── Badge ── */}
            <Section
              id="badge"
              title="Badge"
              description="Etiquetas compactas con 7 variantes semánticas."
            >
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </Section>

            {/* ── Alert ── */}
            <Section
              id="alert"
              title="Alert"
              description="Bloques de mensaje con título y descripción."
            >
              <div className="space-y-3">
                <Alert variant="info">
                  <AlertTitle>Información</AlertTitle>
                  <AlertDescription>Esto es un mensaje informativo.</AlertDescription>
                </Alert>
                <Alert variant="success">
                  <AlertTitle>Listo</AlertTitle>
                  <AlertDescription>La operación se completó correctamente.</AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTitle>Atención</AlertTitle>
                  <AlertDescription>Revisa los datos antes de continuar.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>No se pudo procesar la solicitud.</AlertDescription>
                </Alert>
              </div>
            </Section>

            {/* ── Card ── */}
            <Section
              id="card"
              title="Card"
              description="Contenedor con header/content/footer."
            >
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Crear pedido</CardTitle>
                  <CardDescription>Completa los datos para registrar un pedido nuevo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField label="Cliente">
                    <Input placeholder="Nombre del cliente" />
                  </FormField>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Guardar</Button>
                </CardFooter>
              </Card>
            </Section>

            {/* ── Tabs ── */}
            <Section
              id="tabs"
              title="Tabs"
              description="Navegación entre vistas con underline minimalista."
            >
              <Tabs value={demoTab} onValueChange={setDemoTab}>
                <TabsList>
                  <TabsTrigger value="one">Resumen</TabsTrigger>
                  <TabsTrigger value="two">Detalles</TabsTrigger>
                  <TabsTrigger value="three">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="one">
                  <p className="text-sm text-muted-foreground">Contenido del tab "Resumen".</p>
                </TabsContent>
                <TabsContent value="two">
                  <p className="text-sm text-muted-foreground">Contenido del tab "Detalles".</p>
                </TabsContent>
                <TabsContent value="three">
                  <p className="text-sm text-muted-foreground">Contenido del tab "Historial".</p>
                </TabsContent>
              </Tabs>
            </Section>

            {/* ── Table ── */}
            <Section id="table" title="Table" description="Tabla minimalista con hover sutil.">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Medicamento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DUMMY_ROWS.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>{r.paciente}</TableCell>
                      <TableCell className="text-muted-foreground">{r.medicamento}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.estado === 'ENTREGADO'
                              ? 'success'
                              : r.estado === 'CANCELADO'
                                ? 'destructive'
                                : r.estado === 'EN PROCESO'
                                  ? 'info'
                                  : 'warning'
                          }
                        >
                          {r.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            {/* ── Pagination ── */}
            <Section
              id="pagination"
              title="Pagination"
              description="Controles prev/next con indicador de página."
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setDemoPage(p => Math.max(1, p - 1))}
                      disabled={demoPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationStatus page={demoPage} totalPages={totalPages} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setDemoPage(p => Math.min(totalPages, p + 1))}
                      disabled={demoPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Section>

            {/* ── Misc ── */}
            <Section id="misc" title="Separator + Spinner" description="Utilitarios pequeños.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-foreground">Separator</p>
                  <Separator />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">Spinner:</span>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </Container>
  );
}
