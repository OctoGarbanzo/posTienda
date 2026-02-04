-- SCRIPT DE REPARACIÓN Y SINCRONIZACIÓN PARA TIENTO
-- Ejecuta esto en el SQL Editor de Supabase para asegurar que las tablas de Tiento tengan la estructura correcta.

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
    id text NOT NULL,
    title text NOT NULL,
    price numeric NOT NULL,
    description text,
    category text,
    media_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- 2. TABLA DE EMPLEADOS (Asegurar columnas para Tiento)
CREATE TABLE IF NOT EXISTS public.employees (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    name text NOT NULL,
    daily_salary numeric NOT NULL,
    hire_date date,
    cedula text,
    position text,
    contract_type text CHECK (contract_type = ANY (ARRAY['Tiempo Definido'::text, 'Tiempo Indefinido'::text])),
    payment_type text CHECK (payment_type = ANY (ARRAY['Semanal'::text, 'Quincenal'::text, 'Mensual'::text])),
    exit_date date,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employees_pkey PRIMARY KEY (id)
);

-- 3. TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS public.sales (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    total_amount numeric NOT NULL,
    payment_method text,
    user_id bigint,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sales_pkey PRIMARY KEY (id),
    CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 4. TABLA DE DETALLES DE VENTA (Sincronizada con el esquema actual)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    sale_id bigint,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sale_items_pkey PRIMARY KEY (id),
    CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);

-- Intentar agregar product_id si no existe (opcional pero recomendado)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sale_items' AND column_name='product_id') THEN
        ALTER TABLE public.sale_items ADD COLUMN product_id text;
    END IF;
END $$;

-- 5. TABLA DE GASTOS
CREATE TABLE IF NOT EXISTS public.expenses (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    category text NOT NULL,
    amount numeric NOT NULL,
    description text,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_pkey PRIMARY KEY (id)
);

-- 6. TABLAS DE GESTIÓN LABORAL
CREATE TABLE IF NOT EXISTS public.employee_work_logs (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    employee_id bigint,
    days_worked integer NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_payment numeric NOT NULL,
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text])),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_work_logs_pkey PRIMARY KEY (id),
    CONSTRAINT employee_work_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

CREATE TABLE IF NOT EXISTS public.employee_worked_days (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    employee_id bigint,
    work_date date NOT NULL,
    daily_rate numeric NOT NULL,
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text])),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_worked_days_pkey PRIMARY KEY (id),
    CONSTRAINT employee_worked_days_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

CREATE TABLE IF NOT EXISTS public.cesantias (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    employee_id bigint,
    amount numeric NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cesantias_pkey PRIMARY KEY (id),
    CONSTRAINT cesantias_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

CREATE TABLE IF NOT EXISTS public.settlements (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    employee_id bigint,
    aguinaldo_amount numeric NOT NULL,
    cesantia_amount numeric NOT NULL,
    total_amount numeric NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT settlements_pkey PRIMARY KEY (id),
    CONSTRAINT settlements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

-- 7. TABLA DE USUARIOS (Si no existe)
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'waiter'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
